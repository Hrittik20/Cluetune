import { DurableObject, type WorkerWebSocket } from "cloudflare:workers";
import { filterCatalog, getTrack, shuffleByPopularity } from "../../lib/catalog";
import { canAct, createEngine, isInPlay, reduce, snapshotFor, wakeAt, type EngineEvent, type EngineState } from "../../lib/duel/engine";
import {
  DUEL_TRACKS,
  EMOTES,
  GUESS_MAX,
  PUBLIC_JOIN_TIMEOUT_MS,
  ROOM_IDLE_MS,
  type ClientMessage,
  type DuelErrorCode,
  type HeadToHead,
  type RevealedTrack,
  type RoomKind,
  type Seat,
  type ServerMessage,
} from "../../lib/duel/protocol";
import { readHeadToHead, recordDuelMatch, type HeadToHeadRecord } from "../../lib/duel/store";
import { judgeGuess } from "../../lib/matching";
import { resolvePlayable } from "../../lib/providers/resolver";
import type { GuessVerdict } from "../../lib/types";
import { safeNickname } from "../../lib/duel/nickname";
import { matchmakerStub } from "./stubs";

/**
 * One Durable Object per Duel room. Holds the authoritative match state, owns
 * every timer (through a single alarm), judges guesses against tracks the
 * clients never see, and serves audio only through opaque per-match tokens.
 *
 * Sockets use the hibernation API, so all state that must survive eviction is
 * persisted after every change and reloaded in the constructor.
 */

export interface RoomInit {
  roomId: string;
  code: string | null;
  kind: RoomKind;
  /** Quick-match rooms only admit the two players that were paired. */
  allowed: string[] | null;
}

interface RoomMeta extends RoomInit {
  createdAt: number;
  bot: boolean;
}

interface MatchTrack {
  trackId: string;
  previewUrl: string;
  token: string;
  revealed: RevealedTrack;
}

interface Attachment {
  seat: Seat | null;
  lastEmoteAt: number;
}

interface BotPlan {
  key: string;
  at: number;
  verdict: GuessVerdict;
}

interface Persisted {
  meta: RoomMeta | null;
  engine: EngineState;
  seatTokens: [string | null, string | null];
  tracks: MatchTrack[];
  tracksForMatch: number;
  recent: string[];
  h2h: HeadToHeadRecord | null;
  bot: BotPlan | null;
  lastActive: number;
}

const BOT_ID = "cluebot";
const BOT_NAME = "Cluebot";
/** Chance the dev bot is right on each ladder step. */
const BOT_ACCURACY = [0.12, 0.25, 0.4, 0.55, 0.7, 0.8];
const EMOTE_COOLDOWN_MS = 1200;
const RECENT_LIMIT = 60;
const POOL = { genres: [], decades: [], difficulty: [1, 3] as [1, 3] };

export class DuelRoom extends DurableObject {
  private s: Persisted = emptyPersisted();
  private pending: (() => Promise<void>)[] = [];

  constructor(...args: ConstructorParameters<typeof DurableObject>) {
    super(...args);
    void this.ctx.blockConcurrencyWhile(async () => {
      const saved = await this.ctx.storage.get<Persisted>("room");
      if (saved) this.s = saved;
    });
  }

  // -------------------------------------------------------------------------
  // RPC
  // -------------------------------------------------------------------------

  async init(init: RoomInit): Promise<void> {
    if (this.s.meta) return;
    const now = Date.now();
    this.s.meta = { ...init, createdAt: now, bot: false };
    this.s.lastActive = now;
    await this.persist();
    await this.scheduleAlarm();
  }

  async audioSource(token: string): Promise<string | null> {
    if (this.s.tracksForMatch !== this.s.engine.match) return null;
    return this.s.tracks.find((track) => track.token === token)?.previewUrl ?? null;
  }

  // -------------------------------------------------------------------------
  // Sockets
  // -------------------------------------------------------------------------

  async fetch(request: Request): Promise<Response> {
    const meta = this.s.meta;
    if (!meta) return new Response("Room not found.", { status: 404 });
    if (request.headers.get("upgrade") !== "websocket") return new Response("Expected a websocket.", { status: 426 });

    const url = new URL(request.url);
    if (url.searchParams.get("bot") === "1" && import.meta.env.DEV && meta.kind === "private" && !meta.bot) {
      meta.bot = true;
      await this.persist();
    }

    const pair = new WebSocketPair();
    const server = pair[1];
    this.ctx.acceptWebSocket(server);
    server.serializeAttachment({ seat: null, lastEmoteAt: 0 } satisfies Attachment);
    return new Response(null, { status: 101, webSocket: pair[0] });
  }

  async webSocketMessage(ws: WorkerWebSocket, raw: string | ArrayBuffer): Promise<void> {
    if (typeof raw !== "string" || raw.length > 2048) return;
    let msg: ClientMessage;
    try {
      msg = JSON.parse(raw) as ClientMessage;
    } catch {
      return;
    }

    const now = Date.now();
    if (msg.type === "ping") {
      send(ws, { type: "pong", t: Number(msg.t) || 0, server: now });
      return;
    }

    if (msg.type === "hello") {
      await this.onHello(ws, msg, now);
      await this.flush();
      return;
    }

    const attachment = attachmentOf(ws);
    const seat = attachment.seat;
    if (seat === null) {
      sendError(ws, "not-allowed", "Say hello first.");
      return;
    }

    switch (msg.type) {
      case "ready":
        await this.dispatch({ type: "ready", seat, match: Number(msg.match), now });
        break;
      case "guess": {
        if (!canAct(this.s.engine, seat)) break;
        const label = String(msg.label ?? "").slice(0, GUESS_MAX);
        const track = this.currentTrack();
        if (!track) break;
        await this.dispatch({ type: "act", seat, verdict: judgeGuess(label, track), label, now });
        break;
      }
      case "skip":
        await this.dispatch({ type: "act", seat, verdict: "skip", label: "", now });
        break;
      case "emote":
        if (!EMOTES.includes(msg.emote) || now - attachment.lastEmoteAt < EMOTE_COOLDOWN_MS) break;
        ws.serializeAttachment({ ...attachment, lastEmoteAt: now } satisfies Attachment);
        this.broadcastRaw({ type: "emote", seat, emote: msg.emote });
        break;
      case "rematch":
        await this.dispatch({ type: "rematch", seat, now });
        break;
      case "leave":
        ws.serializeAttachment({ ...attachment, seat: null } satisfies Attachment);
        await this.dispatch({ type: "leave", seat, now });
        ws.close(1000, "left");
        break;
    }
    await this.flush();
  }

  async webSocketClose(ws: WorkerWebSocket): Promise<void> {
    await this.onSocketGone(ws);
  }

  async webSocketError(ws: WorkerWebSocket): Promise<void> {
    await this.onSocketGone(ws);
  }

  async alarm(): Promise<void> {
    const now = Date.now();
    const meta = this.s.meta;
    if (!meta) return;

    const bot = this.s.bot;
    const botSeat = this.botSeat();
    if (bot && botSeat !== null && bot.at <= now && canAct(this.s.engine, botSeat)) {
      this.s.bot = null;
      await this.dispatch({ type: "act", seat: botSeat, verdict: bot.verdict, label: bot.verdict, now });
    }

    const wake = wakeAt(this.s.engine);
    if (wake != null && wake <= now) await this.dispatch({ type: "tick", now });

    if (
      meta.kind === "public" &&
      this.s.engine.phase === "lobby" &&
      now - meta.createdAt >= PUBLIC_JOIN_TIMEOUT_MS
    ) {
      for (const socket of this.ctx.getWebSockets()) {
        sendError(socket, "opponent-missing", "Your opponent didn't show up. Finding you someone else.");
        socket.close(4000, "opponent-missing");
      }
      await this.destroy();
      return;
    }

    const idle = now - this.s.lastActive >= ROOM_IDLE_MS;
    if (idle && !isInPlay(this.s.engine) && !this.openSockets().length) {
      await this.destroy();
      return;
    }

    await this.flush();
    await this.scheduleAlarm();
  }

  // -------------------------------------------------------------------------

  private async onHello(ws: WorkerWebSocket, msg: Extract<ClientMessage, { type: "hello" }>, now: number): Promise<void> {
    const meta = this.s.meta!;
    const playerId = typeof msg.playerId === "string" ? msg.playerId.trim().slice(0, 64) : "";
    if (!playerId || playerId === BOT_ID) {
      sendError(ws, "bad-request", "Missing player id.");
      return;
    }

    const { engine, seatTokens } = this.s;
    let seat: Seat | null = null;

    if (typeof msg.seatToken === "string" && msg.seatToken) {
      const index = seatTokens.indexOf(msg.seatToken);
      if (index === 0 || index === 1) seat = index;
    }
    if (seat === null) {
      for (const candidate of [0, 1] as const) {
        if (engine.seats[candidate]?.playerId === playerId) seat = candidate;
      }
    }
    if (seat === null && meta.allowed && !meta.allowed.includes(playerId)) {
      sendError(ws, "not-allowed", "This match is for someone else.");
      ws.close(4003, "not-allowed");
      return;
    }
    if (seat === null) {
      seat = engine.seats[0] === null ? 0 : engine.seats[1] === null ? 1 : null;
    }
    if (seat === null) {
      sendError(ws, "room-full", "This room already has two players.");
      ws.close(4009, "room-full");
      return;
    }

    // A second tab for the same seat replaces the first instead of fighting it.
    for (const other of this.openSockets()) {
      if (other !== ws && attachmentOf(other).seat === seat) {
        other.serializeAttachment({ ...attachmentOf(other), seat: null } satisfies Attachment);
        other.close(4001, "replaced");
      }
    }
    ws.serializeAttachment({ ...attachmentOf(ws), seat } satisfies Attachment);

    const token = seatTokens[seat] ?? crypto.randomUUID();
    seatTokens[seat] = token;

    const existing = engine.seats[seat];
    if (!existing) this.s.h2h = null;
    await this.dispatch(
      {
        type: "join",
        seat,
        playerId: existing?.playerId ?? playerId,
        name: safeNickname(msg.name),
        isBot: false,
        now,
      },
      { broadcast: false },
    );

    send(ws, { type: "welcome", seat, seatToken: token, snapshot: this.snapshot(seat) });
    this.broadcast();

    if (this.s.tracksForMatch === this.s.engine.match && this.s.engine.phase !== "lobby") {
      send(ws, this.audioMessage());
    }

    if (meta.bot && this.s.engine.phase === "lobby") {
      const free = this.s.engine.seats[0] === null ? 0 : this.s.engine.seats[1] === null ? 1 : null;
      if (free !== null) {
        await this.dispatch({ type: "join", seat: free, playerId: BOT_ID, name: BOT_NAME, isBot: true, now });
      }
    }
  }

  private async onSocketGone(ws: WorkerWebSocket): Promise<void> {
    const seat = attachmentOf(ws).seat;
    if (seat === null) return;
    const stillHere = this.openSockets().some((other) => other !== ws && attachmentOf(other).seat === seat);
    if (stillHere) return;
    await this.dispatch({ type: "disconnect", seat, now: Date.now() });
    await this.flush();
  }

  private async dispatch(event: EngineEvent, options: { broadcast?: boolean } = {}): Promise<void> {
    const before = this.s.engine;
    const after = reduce(before, event);
    if (after === before) return;

    this.s.engine = after;
    this.s.lastActive = event.now;
    this.onTransition(before, after);
    this.planBot(event.now);

    await this.persist();
    await this.scheduleAlarm();
    if (options.broadcast !== false) this.broadcast();
  }

  /** Runs slow side effects (provider lookups, D1) after the triggering message is handled. */
  private async flush(): Promise<void> {
    while (this.pending.length) {
      const job = this.pending.shift()!;
      try {
        await job();
      } catch (error) {
        console.error("duel room job failed", error);
      }
    }
  }

  private onTransition(before: EngineState, after: EngineState): void {
    const roomId = this.s.meta!.roomId;

    if (after.phase === "loading" && (before.phase !== "loading" || before.match !== after.match)) {
      const match = after.match;
      this.pending.push(() => this.prepareTracks(match));
    }

    if (after.phase === "countdown" && after.round === 0 && before.phase === "loading") {
      log("match-started", { roomId, match: after.match });
      this.pending.push(() => matchmakerStub(this.env).roomEvent({ type: "started", roomId, at: Date.now() }));
    }

    if (after.phase === "ended" && before.phase !== "ended") {
      this.pending.push(() => this.onMatchEnd(after));
    }
  }

  private async prepareTracks(match: number): Promise<void> {
    const recent = new Set(this.s.recent);
    let pool = filterCatalog(POOL).filter((track) => !recent.has(track.id));
    if (pool.length < DUEL_TRACKS * 3) pool = filterCatalog(POOL);

    const resolved = (await resolvePlayable(shuffleByPopularity(pool), DUEL_TRACKS, DUEL_TRACKS + 6)).filter(
      (entry) => entry.source?.kind === "audio",
    );

    if (this.s.engine.match !== match || this.s.engine.phase !== "loading") return;

    if (resolved.length < DUEL_TRACKS) {
      log("tracks-unavailable", { roomId: this.s.meta!.roomId, found: resolved.length });
      this.broadcastRaw({ type: "error", code: "tracks-unavailable", message: "We couldn't load songs right now. Try again." });
      await this.dispatch({ type: "abort", now: Date.now() });
      return;
    }

    this.s.tracks = resolved.slice(0, DUEL_TRACKS).map((entry) => ({
      trackId: entry.track.id,
      previewUrl: entry.source!.ref,
      token: crypto.randomUUID().replace(/-/g, ""),
      revealed: {
        title: entry.track.title,
        artist: entry.track.artist,
        album: entry.track.album,
        year: entry.track.year,
        artworkUrl: entry.source!.artworkUrl,
        attribution: entry.source!.attribution,
      },
    }));
    this.s.tracksForMatch = match;
    this.s.recent = [...this.s.tracks.map((track) => track.trackId), ...this.s.recent].slice(0, RECENT_LIMIT);
    await this.persist();

    this.broadcastRaw(this.audioMessage());
    await this.dispatch({ type: "audio-delivered", now: Date.now() });
  }

  private async onMatchEnd(state: EngineState): Promise<void> {
    const meta = this.s.meta!;
    const [a, b] = state.seats;
    const result = state.result!;
    const now = Date.now();
    log("match-ended", { roomId: meta.roomId, match: state.match, reason: result.reason });

    if (a && b && !a.isBot && !b.isBot && result.reason !== "cancelled") {
      await recordDuelMatch({
        id: `${meta.roomId}:${state.match}`,
        roomId: meta.roomId,
        kind: meta.kind,
        playerIds: [a.playerId, b.playerId],
        names: [a.name, b.name],
        scores: result.scores,
        winner: result.winner,
        reason: result.reason,
        trackIds: this.s.tracks.slice(0, state.rounds.length).map((track) => track.trackId),
        startedAt: state.matchStartedAt ?? now,
        endedAt: now,
      });
      this.s.h2h = await readHeadToHead([a.playerId, b.playerId]);
      await this.persist();
      this.broadcast();
    }

    await matchmakerStub(this.env).roomEvent({
      type: "finished",
      roomId: meta.roomId,
      at: now,
      durationMs: now - (state.matchStartedAt ?? now),
    });
  }

  private planBot(now: number): void {
    const seat = this.botSeat();
    const engine = this.s.engine;
    if (seat === null || !canAct(engine, seat)) {
      this.s.bot = null;
      return;
    }
    const key = `${engine.match}:${engine.round}:${engine.step}:${engine.phase}`;
    if (this.s.bot?.key === key) return;

    const closing = engine.phase === "closing";
    const delay = closing ? 900 + Math.random() * 2100 : 1500 + Math.random() * 4500;
    const right = Math.random() < (BOT_ACCURACY[engine.step - 1] ?? 0.8);
    this.s.bot = {
      key,
      at: now + delay,
      verdict: right ? "correct" : Math.random() < 0.3 ? "skip" : "wrong",
    };
  }

  private botSeat(): Seat | null {
    const [a, b] = this.s.engine.seats;
    return a?.isBot ? 0 : b?.isBot ? 1 : null;
  }

  private currentTrack() {
    if (this.s.tracksForMatch !== this.s.engine.match) return undefined;
    const entry = this.s.tracks[this.s.engine.round];
    return entry ? getTrack(entry.trackId) : undefined;
  }

  private audioMessage(): ServerMessage {
    const roomId = this.s.meta!.roomId;
    return {
      type: "audio",
      match: this.s.tracksForMatch,
      clips: this.s.tracks.map((track) => `/api/duel/audio/${roomId}/${track.token}`),
    };
  }

  private snapshot(seat: Seat) {
    const meta = this.s.meta!;
    const sameMatch = this.s.tracksForMatch === this.s.engine.match;
    return snapshotFor(this.s.engine, seat, {
      roomId: meta.roomId,
      code: meta.code,
      kind: meta.kind,
      now: Date.now(),
      tracks: sameMatch ? this.s.tracks.map((track) => track.revealed) : [],
      headToHead: headToHeadFor(this.s.h2h, seat),
    });
  }

  private broadcast(): void {
    for (const ws of this.openSockets()) {
      const seat = attachmentOf(ws).seat;
      if (seat !== null) send(ws, { type: "state", snapshot: this.snapshot(seat) });
    }
  }

  private broadcastRaw(message: ServerMessage): void {
    for (const ws of this.openSockets()) {
      if (attachmentOf(ws).seat !== null) send(ws, message);
    }
  }

  private openSockets(): WorkerWebSocket[] {
    return this.ctx.getWebSockets().filter((ws) => ws.readyState === WebSocket.OPEN);
  }

  private async persist(): Promise<void> {
    await this.ctx.storage.put("room", this.s);
  }

  private async scheduleAlarm(): Promise<void> {
    const meta = this.s.meta;
    if (!meta) return;
    const times = [this.s.lastActive + ROOM_IDLE_MS];
    const wake = wakeAt(this.s.engine);
    if (wake != null) times.push(wake);
    if (this.s.bot) times.push(this.s.bot.at);
    if (meta.kind === "public" && this.s.engine.phase === "lobby") times.push(meta.createdAt + PUBLIC_JOIN_TIMEOUT_MS);
    await this.ctx.storage.setAlarm(Math.min(...times));
  }

  private async destroy(): Promise<void> {
    await this.ctx.storage.deleteAlarm();
    await this.ctx.storage.deleteAll();
    this.s = emptyPersisted();
  }
}

function emptyPersisted(): Persisted {
  return {
    meta: null,
    engine: createEngine(),
    seatTokens: [null, null],
    tracks: [],
    tracksForMatch: 0,
    recent: [],
    h2h: null,
    bot: null,
    lastActive: Date.now(),
  };
}

function attachmentOf(ws: WorkerWebSocket): Attachment {
  return (ws.deserializeAttachment() as Attachment | null) ?? { seat: null, lastEmoteAt: 0 };
}

function send(ws: WorkerWebSocket, message: ServerMessage): void {
  try {
    ws.send(JSON.stringify(message));
  } catch {
    /* Socket already closing; the close handler deals with it. */
  }
}

function sendError(ws: WorkerWebSocket, code: DuelErrorCode, message: string): void {
  send(ws, { type: "error", code, message });
}

function headToHeadFor(record: HeadToHeadRecord | null, seat: Seat): HeadToHead | null {
  if (!record) return null;
  return {
    youWins: record.wins[seat],
    theirWins: record.wins[seat === 0 ? 1 : 0],
    draws: record.draws,
  };
}

function log(event: string, data: Record<string, unknown>): void {
  console.log(JSON.stringify({ duel: event, ...data }));
}

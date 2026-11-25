import { DurableObject, type WorkerWebSocket } from "cloudflare:workers";
import {
  ROOM_CODE_LENGTH,
  type CreateRoomResponse,
  type DuelAdminStats,
  type QueueClientMessage,
  type QueueServerMessage,
} from "../../lib/duel/protocol";
import { safeNickname } from "../../lib/duel/nickname";
import { newRoomId, roomStub } from "./stubs";

/**
 * Singleton Durable Object for everything that needs a global view: the
 * quick-match queue, private room codes, and the counters behind the admin
 * dashboard. The queue socket deliberately never reports how many people are
 * waiting — only `stats()` (admin-only) does.
 */

interface QueueAttachment {
  playerId: string;
  name: string;
  joinedAt: number;
  status: "connected" | "waiting" | "matched";
}

interface CodeEntry {
  roomId: string;
  createdAt: number;
}

interface Counters {
  date: string;
  matchesStarted: number;
  matchesFinished: number;
  privateRoomsCreated: number;
  queueJoins: number;
  queueMatches: number;
  queueAbandons: number;
}

interface MatchmakerState {
  counters: Counters;
  /** Recent queue waits and match lengths, newest last. */
  waits: number[];
  durations: number[];
  /** roomId -> start time for matches in progress. */
  live: Record<string, number>;
}

export type RoomEvent =
  | { type: "started"; roomId: string; at: number }
  | { type: "finished"; roomId: string; at: number; durationMs: number };

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const CODE_TTL_MS = 24 * 60 * 60_000;
/** A match that never reported back is assumed dead after this long. */
const LIVE_TTL_MS = 60 * 60_000;
const SAMPLE_LIMIT = 200;

export class Matchmaker extends DurableObject {
  private state: MatchmakerState = emptyState();

  constructor(...args: ConstructorParameters<typeof DurableObject>) {
    super(...args);
    void this.ctx.blockConcurrencyWhile(async () => {
      const saved = await this.ctx.storage.get<MatchmakerState>("state");
      if (saved) this.state = saved;
    });
  }

  // -------------------------------------------------------------------------
  // Queue socket
  // -------------------------------------------------------------------------

  async fetch(request: Request): Promise<Response> {
    if (request.headers.get("upgrade") !== "websocket") return new Response("Expected a websocket.", { status: 426 });
    const pair = new WebSocketPair();
    const server = pair[1];
    this.ctx.acceptWebSocket(server);
    server.serializeAttachment({ playerId: "", name: "", joinedAt: 0, status: "connected" } satisfies QueueAttachment);
    return new Response(null, { status: 101, webSocket: pair[0] });
  }

  async webSocketMessage(ws: WorkerWebSocket, raw: string | ArrayBuffer): Promise<void> {
    if (typeof raw !== "string" || raw.length > 1024) return;
    let msg: QueueClientMessage;
    try {
      msg = JSON.parse(raw) as QueueClientMessage;
    } catch {
      return;
    }

    if (msg.type === "queue") {
      const playerId = typeof msg.playerId === "string" ? msg.playerId.trim().slice(0, 64) : "";
      if (!playerId) {
        send(ws, { type: "error", code: "bad-request", message: "Missing player id." });
        return;
      }
      if (attachmentOf(ws).status === "waiting") return;

      // One queue slot per player: a second tab takes over from the first.
      for (const other of this.waiting()) {
        if (other !== ws && attachmentOf(other).playerId === playerId) {
          other.serializeAttachment({ ...attachmentOf(other), status: "matched" } satisfies QueueAttachment);
          other.close(4001, "replaced");
        }
      }

      const name = safeNickname(msg.name);
      ws.serializeAttachment({ playerId, name, joinedAt: Date.now(), status: "waiting" } satisfies QueueAttachment);
      this.counters().queueJoins += 1;
      log("queue-join", {});
      send(ws, { type: "queued" });
      await this.pair();
      await this.save();
      return;
    }

    if (msg.type === "cancel") {
      await this.abandon(ws);
      ws.close(1000, "cancelled");
    }
  }

  async webSocketClose(ws: WorkerWebSocket): Promise<void> {
    await this.abandon(ws);
  }

  async webSocketError(ws: WorkerWebSocket): Promise<void> {
    await this.abandon(ws);
  }

  // -------------------------------------------------------------------------
  // RPC
  // -------------------------------------------------------------------------

  async createRoom(): Promise<CreateRoomResponse> {
    await this.purgeCodes();
    let code = randomCode();
    for (let i = 0; i < 20 && (await this.ctx.storage.get<CodeEntry>(codeKey(code))); i++) code = randomCode();

    const roomId = newRoomId();
    await roomStub(this.env, roomId).init({ roomId, code, kind: "private", allowed: null });
    await this.ctx.storage.put(codeKey(code), { roomId, createdAt: Date.now() } satisfies CodeEntry);
    this.counters().privateRoomsCreated += 1;
    await this.save();
    log("room-created", { roomId });
    return { roomId, code };
  }

  async lookup(code: string): Promise<string | null> {
    const normalized = String(code).trim().toUpperCase();
    if (normalized.length !== ROOM_CODE_LENGTH) return null;
    const entry = await this.ctx.storage.get<CodeEntry>(codeKey(normalized));
    if (!entry || Date.now() - entry.createdAt > CODE_TTL_MS) return null;
    return entry.roomId;
  }

  async roomEvent(event: RoomEvent): Promise<void> {
    const counters = this.counters();
    if (event.type === "started") {
      this.state.live[event.roomId] = event.at;
      counters.matchesStarted += 1;
    } else {
      delete this.state.live[event.roomId];
      counters.matchesFinished += 1;
      this.state.durations = [...this.state.durations, event.durationMs].slice(-SAMPLE_LIMIT);
    }
    await this.save();
  }

  async stats(): Promise<DuelAdminStats> {
    const now = Date.now();
    for (const [roomId, startedAt] of Object.entries(this.state.live)) {
      if (now - startedAt > LIVE_TTL_MS) delete this.state.live[roomId];
    }
    const waiting = this.waiting()
      .map((ws) => now - attachmentOf(ws).joinedAt)
      .sort((a, b) => b - a);

    return {
      now,
      queue: { size: waiting.length, waitingMs: waiting },
      liveRooms: Object.keys(this.state.live).length,
      today: { ...this.counters() },
      medianQueueWaitMs: median(this.state.waits),
      medianMatchMs: median(this.state.durations),
    };
  }

  // -------------------------------------------------------------------------

  private async pair(): Promise<void> {
    const queue = this.waiting().sort((a, b) => attachmentOf(a).joinedAt - attachmentOf(b).joinedAt);

    while (queue.length >= 2) {
      const first = queue.shift()!;
      const firstId = attachmentOf(first).playerId;
      const index = queue.findIndex((ws) => attachmentOf(ws).playerId !== firstId);
      if (index < 0) break;
      const [second] = queue.splice(index, 1);

      const a = attachmentOf(first);
      const b = attachmentOf(second!);
      const roomId = newRoomId();
      await roomStub(this.env, roomId).init({ roomId, code: null, kind: "public", allowed: [a.playerId, b.playerId] });

      const now = Date.now();
      for (const [ws, attachment] of [
        [first, a],
        [second!, b],
      ] as const) {
        ws.serializeAttachment({ ...attachment, status: "matched" } satisfies QueueAttachment);
        send(ws, { type: "matched", roomId });
        ws.close(1000, "matched");
        this.state.waits = [...this.state.waits, now - attachment.joinedAt].slice(-SAMPLE_LIMIT);
      }
      this.counters().queueMatches += 1;
      log("queue-matched", { roomId });
    }
  }

  private async abandon(ws: WorkerWebSocket): Promise<void> {
    const attachment = attachmentOf(ws);
    if (attachment.status !== "waiting") return;
    ws.serializeAttachment({ ...attachment, status: "matched" } satisfies QueueAttachment);
    this.counters().queueAbandons += 1;
    log("queue-leave", { waitedMs: Date.now() - attachment.joinedAt });
    await this.save();
  }

  private waiting(): WorkerWebSocket[] {
    return this.ctx
      .getWebSockets()
      .filter((ws) => ws.readyState === WebSocket.OPEN && attachmentOf(ws).status === "waiting");
  }

  private counters(): Counters {
    const today = new Date().toISOString().slice(0, 10);
    if (this.state.counters.date !== today) this.state.counters = emptyCounters(today);
    return this.state.counters;
  }

  private async purgeCodes(): Promise<void> {
    const entries = await this.ctx.storage.list<CodeEntry>({ prefix: "code:" });
    const now = Date.now();
    const expired = [...entries].filter(([, entry]) => now - entry.createdAt > CODE_TTL_MS).map(([key]) => key);
    if (expired.length) await this.ctx.storage.delete(expired);
  }

  private async save(): Promise<void> {
    await this.ctx.storage.put("state", this.state);
  }
}

function emptyCounters(date: string): Counters {
  return {
    date,
    matchesStarted: 0,
    matchesFinished: 0,
    privateRoomsCreated: 0,
    queueJoins: 0,
    queueMatches: 0,
    queueAbandons: 0,
  };
}

function emptyState(): MatchmakerState {
  return { counters: emptyCounters(new Date().toISOString().slice(0, 10)), waits: [], durations: [], live: {} };
}

function attachmentOf(ws: WorkerWebSocket): QueueAttachment {
  return (
    (ws.deserializeAttachment() as QueueAttachment | null) ?? { playerId: "", name: "", joinedAt: 0, status: "connected" }
  );
}

function send(ws: WorkerWebSocket, message: QueueServerMessage): void {
  try {
    ws.send(JSON.stringify(message));
  } catch {
    /* Closing already. */
  }
}

function randomCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(ROOM_CODE_LENGTH));
  return [...bytes].map((byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length]).join("");
}

function codeKey(code: string): string {
  return `code:${code}`;
}

function median(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid]! : Math.round((sorted[mid - 1]! + sorted[mid]!) / 2);
}

function log(event: string, data: Record<string, unknown>): void {
  console.log(JSON.stringify({ duel: event, ...data }));
}

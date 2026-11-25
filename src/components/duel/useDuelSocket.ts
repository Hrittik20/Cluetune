import { useCallback, useEffect, useRef, useState } from "react";
import type {
  ClientMessage,
  DuelErrorCode,
  DuelSnapshot,
  Emote,
  Seat,
  ServerMessage,
} from "../../lib/duel/protocol";

export type DuelConnection = "connecting" | "open" | "reconnecting" | "closed";

export interface DuelEmoteEvent {
  id: number;
  seat: Seat;
  emote: Emote;
}

export interface DuelError {
  code: DuelErrorCode | "connection";
  message: string;
}

export interface UseDuelSocketResult {
  connection: DuelConnection;
  snapshot: DuelSnapshot | null;
  /** Clip URLs for `audioMatch`; stale once `snapshot.match` moves past it. */
  clips: string[];
  audioMatch: number;
  emotes: DuelEmoteEvent[];
  error: DuelError | null;
  /** Current time on the server's clock, in epoch ms. */
  serverNow: () => number;
  /** Converts a server timestamp to the local `Date.now()` timeline. */
  toLocal: (serverTime: number) => number;
  ready: (match: number) => void;
  guess: (label: string) => void;
  skip: () => void;
  emote: (emote: Emote) => void;
  rematch: () => void;
  leave: () => void;
}

/** Close codes the room uses for "do not come back". */
const TERMINAL_CLOSE_CODES = new Set([4000, 4001, 4003, 4009]);
const PING_BURST = 5;
const PING_INTERVAL_MS = 5000;
const MAX_BACKOFF_MS = 8000;
const EMOTE_TTL_MS = 2500;

function seatTokenKey(roomId: string): string {
  return `cluetune:duel-seat:${roomId}`;
}

/**
 * Owns the room websocket: hello/seat-token handshake, reconnect with
 * backoff, and a server clock estimate. The offset keeps the lowest-RTT sample
 * (NTP-style midpoint), which is what makes every client's countdown and step
 * timer line up regardless of their own clock.
 */
export function useDuelSocket(options: {
  roomId: string;
  playerId: string;
  name?: string;
  /** Dev only: fill the other seat with the scripted bot. */
  bot?: boolean;
}): UseDuelSocketResult {
  const { roomId, playerId, name, bot } = options;
  const wsRef = useRef<WebSocket | null>(null);
  const offsetRef = useRef(0);
  const bestRttRef = useRef(Number.POSITIVE_INFINITY);
  const leftRef = useRef(false);
  const emoteIdRef = useRef(0);

  const [connection, setConnection] = useState<DuelConnection>("connecting");
  const [snapshot, setSnapshot] = useState<DuelSnapshot | null>(null);
  const [clips, setClips] = useState<string[]>([]);
  const [audioMatch, setAudioMatch] = useState(0);
  const [emotes, setEmotes] = useState<DuelEmoteEvent[]>([]);
  const [error, setError] = useState<DuelError | null>(null);

  const send = useCallback((message: ClientMessage) => {
    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify(message));
  }, []);

  useEffect(() => {
    leftRef.current = false;
    let attempt = 0;
    let disposed = false;
    let reconnectTimer: number | undefined;
    let pingTimer: number | undefined;

    const connect = () => {
      const protocol = location.protocol === "https:" ? "wss:" : "ws:";
      const query = bot ? "?bot=1" : "";
      const ws = new WebSocket(`${protocol}//${location.host}/api/duel/room/${roomId}${query}`);
      wsRef.current = ws;

      const ping = () => {
        if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: "ping", t: Date.now() } satisfies ClientMessage));
      };

      ws.onopen = () => {
        attempt = 0;
        bestRttRef.current = Number.POSITIVE_INFINITY;
        const seatToken = sessionStorage.getItem(seatTokenKey(roomId)) ?? undefined;
        ws.send(JSON.stringify({ type: "hello", playerId, name, seatToken } satisfies ClientMessage));
        for (let i = 0; i < PING_BURST; i++) window.setTimeout(ping, i * 120);
        pingTimer = window.setInterval(ping, PING_INTERVAL_MS);
      };

      ws.onmessage = (event) => {
        let msg: ServerMessage;
        try {
          msg = JSON.parse(String(event.data)) as ServerMessage;
        } catch {
          return;
        }

        switch (msg.type) {
          case "pong": {
            const now = Date.now();
            const rtt = now - msg.t;
            if (rtt >= 0 && rtt <= bestRttRef.current) {
              bestRttRef.current = rtt;
              offsetRef.current = msg.server - (msg.t + rtt / 2);
            }
            break;
          }
          case "welcome":
            sessionStorage.setItem(seatTokenKey(roomId), msg.seatToken);
            setConnection("open");
            setError(null);
            setSnapshot(msg.snapshot);
            break;
          case "state":
            setSnapshot(msg.snapshot);
            break;
          case "audio":
            setClips(msg.clips);
            setAudioMatch(msg.match);
            break;
          case "emote": {
            const id = ++emoteIdRef.current;
            setEmotes((list) => [...list.slice(-5), { id, seat: msg.seat, emote: msg.emote }]);
            window.setTimeout(() => setEmotes((list) => list.filter((e) => e.id !== id)), EMOTE_TTL_MS);
            break;
          }
          case "error":
            setError({ code: msg.code, message: msg.message });
            break;
        }
      };

      ws.onclose = (event) => {
        window.clearInterval(pingTimer);
        if (wsRef.current === ws) wsRef.current = null;
        if (disposed) return;

        if (leftRef.current || TERMINAL_CLOSE_CODES.has(event.code)) {
          setConnection("closed");
          return;
        }
        setConnection("reconnecting");
        const delay = Math.min(MAX_BACKOFF_MS, 500 * 2 ** attempt++);
        reconnectTimer = window.setTimeout(connect, delay);
      };
    };

    setConnection("connecting");
    connect();

    // Phones suspend sockets in the background; reconnect as soon as we're back.
    const onVisible = () => {
      if (document.visibilityState === "visible" && !wsRef.current && !leftRef.current && !disposed) {
        window.clearTimeout(reconnectTimer);
        connect();
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      disposed = true;
      document.removeEventListener("visibilitychange", onVisible);
      window.clearTimeout(reconnectTimer);
      window.clearInterval(pingTimer);
      wsRef.current?.close(1000, "unmount");
      wsRef.current = null;
    };
  }, [roomId, playerId, name, bot]);

  const serverNow = useCallback(() => Date.now() + offsetRef.current, []);
  const toLocal = useCallback((serverTime: number) => serverTime - offsetRef.current, []);

  return {
    connection,
    snapshot,
    clips,
    audioMatch,
    emotes,
    error,
    serverNow,
    toLocal,
    ready: useCallback((match: number) => send({ type: "ready", match }), [send]),
    guess: useCallback((label: string) => send({ type: "guess", label }), [send]),
    skip: useCallback(() => send({ type: "skip" }), [send]),
    emote: useCallback((emote: Emote) => send({ type: "emote", emote }), [send]),
    rematch: useCallback(() => send({ type: "rematch" }), [send]),
    leave: useCallback(() => {
      leftRef.current = true;
      send({ type: "leave" });
      sessionStorage.removeItem(seatTokenKey(roomId));
    }, [send, roomId]),
  };
}

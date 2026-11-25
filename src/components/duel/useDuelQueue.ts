import { useCallback, useEffect, useRef, useState } from "react";
import type { QueueClientMessage, QueueServerMessage } from "../../lib/duel/protocol";

export type QueueStatus = "idle" | "connecting" | "waiting" | "matched" | "error";

export interface UseDuelQueueResult {
  status: QueueStatus;
  roomId: string | null;
  /** Local time the player entered the queue, for the "60s → play a friend" prompt. */
  joinedAt: number | null;
  error: string | null;
  join: () => void;
  cancel: () => void;
}

const RETRY_MS = 1500;

/**
 * Quick-match queue socket. The server never sends a queue size, so there is
 * nothing here to display one with — by design.
 */
export function useDuelQueue(options: { playerId: string; name?: string }): UseDuelQueueResult {
  const { playerId, name } = options;
  const wsRef = useRef<WebSocket | null>(null);
  const wantRef = useRef(false);
  const retryRef = useRef<number | undefined>(undefined);

  const [status, setStatus] = useState<QueueStatus>("idle");
  const [roomId, setRoomId] = useState<string | null>(null);
  const [joinedAt, setJoinedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(() => {
    const protocol = location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${location.host}/api/duel/queue`);
    wsRef.current = ws;
    setStatus("connecting");

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "queue", playerId, name } satisfies QueueClientMessage));
    };

    ws.onmessage = (event) => {
      let msg: QueueServerMessage;
      try {
        msg = JSON.parse(String(event.data)) as QueueServerMessage;
      } catch {
        return;
      }
      if (msg.type === "queued") {
        setStatus("waiting");
        setJoinedAt((at) => at ?? Date.now());
      } else if (msg.type === "matched") {
        wantRef.current = false;
        setRoomId(msg.roomId);
        setStatus("matched");
      } else if (msg.type === "error") {
        setError(msg.message);
      }
    };

    ws.onclose = () => {
      if (wsRef.current === ws) wsRef.current = null;
      // A dropped queue socket quietly rejoins; the player keeps their place in spirit.
      if (wantRef.current) retryRef.current = window.setTimeout(connect, RETRY_MS);
    };
  }, [playerId, name]);

  const join = useCallback(() => {
    if (wantRef.current) return;
    wantRef.current = true;
    setError(null);
    setRoomId(null);
    setJoinedAt(null);
    connect();
  }, [connect]);

  const cancel = useCallback(() => {
    wantRef.current = false;
    window.clearTimeout(retryRef.current);
    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: "cancel" } satisfies QueueClientMessage));
    ws?.close(1000, "cancel");
    wsRef.current = null;
    setStatus("idle");
    setJoinedAt(null);
  }, []);

  useEffect(
    () => () => {
      wantRef.current = false;
      window.clearTimeout(retryRef.current);
      wsRef.current?.close(1000, "unmount");
    },
    [],
  );

  return { status, roomId, joinedAt, error, join, cancel };
}

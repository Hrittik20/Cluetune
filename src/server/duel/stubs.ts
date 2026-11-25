import type { WorkerEnv } from "cloudflare:workers";

/** Every queue, room code and stat lives in one Matchmaker instance. */
const MATCHMAKER_NAME = "global";

export function matchmakerStub(env: WorkerEnv) {
  return env.MATCHMAKER.get(env.MATCHMAKER.idFromName(MATCHMAKER_NAME));
}

export function roomStub(env: WorkerEnv, roomId: string) {
  return env.DUEL_ROOM.get(env.DUEL_ROOM.idFromName(roomId));
}

export function newRoomId(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 20);
}

export const ROOM_ID_PATTERN = /^[a-f0-9]{20}$/;

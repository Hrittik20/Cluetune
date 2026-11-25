/**
 * The slice of the Workers runtime this app touches. Kept hand-written so the
 * full workers-types globals don't collide with the DOM lib used by the client.
 */
declare module "cloudflare:workers" {
  interface D1Result<T = Record<string, unknown>> {
    results: T[];
    success: boolean;
    meta: { changes: number };
  }

  interface D1PreparedStatement {
    bind(...values: unknown[]): D1PreparedStatement;
    all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
    first<T = Record<string, unknown>>(): Promise<T | null>;
    run(): Promise<D1Result>;
  }

  interface D1Database {
    prepare(query: string): D1PreparedStatement;
    batch(statements: D1PreparedStatement[]): Promise<D1Result[]>;
  }

  interface RateLimit {
    limit(options: { key: string }): Promise<{ success: boolean }>;
  }

  /** Server-side socket with the Workers-only hibernation extras. */
  interface WorkerWebSocket extends WebSocket {
    accept(): void;
    serializeAttachment(value: unknown): void;
    deserializeAttachment(): unknown;
  }

  interface DurableObjectStorage {
    get<T>(key: string): Promise<T | undefined>;
    put(key: string, value: unknown): Promise<void>;
    put(entries: Record<string, unknown>): Promise<void>;
    delete(key: string): Promise<boolean>;
    delete(keys: string[]): Promise<number>;
    list<T>(options?: { prefix?: string; limit?: number }): Promise<Map<string, T>>;
    deleteAll(): Promise<void>;
    setAlarm(scheduledTime: number): Promise<void>;
    getAlarm(): Promise<number | null>;
    deleteAlarm(): Promise<void>;
  }

  interface DurableObjectState {
    readonly storage: DurableObjectStorage;
    acceptWebSocket(ws: WorkerWebSocket, tags?: string[]): void;
    getWebSockets(tag?: string): WorkerWebSocket[];
    blockConcurrencyWhile<T>(callback: () => Promise<T>): Promise<T>;
  }

  interface DurableObjectId {
    toString(): string;
  }

  /** `T` is the RPC surface: public methods of the Durable Object class. */
  type DurableObjectStub<T = unknown> = {
    fetch(request: Request): Promise<Response>;
  } & {
    [K in keyof T]: T[K] extends (...args: infer A) => infer R ? (...args: A) => Promise<Awaited<R>> : never;
  };

  interface DurableObjectNamespace<T = unknown> {
    idFromName(name: string): DurableObjectId;
    get(id: DurableObjectId): DurableObjectStub<T>;
  }

  interface ExecutionContext {
    waitUntil(promise: Promise<unknown>): void;
    passThroughOnException(): void;
  }

  interface WorkerEnv {
    DB?: D1Database;
    RESULT_LIMITER?: RateLimit;
    DUEL_ROOM: DurableObjectNamespace<import("./server/duel/DuelRoom").DuelRoom>;
    MATCHMAKER: DurableObjectNamespace<import("./server/duel/Matchmaker").Matchmaker>;
    ADMIN_TOKEN?: string;
  }

  export abstract class DurableObject {
    protected ctx: DurableObjectState;
    protected env: WorkerEnv;
    constructor(ctx: DurableObjectState, env: WorkerEnv);
    fetch?(request: Request): Response | Promise<Response>;
    alarm?(): void | Promise<void>;
    webSocketMessage?(ws: WorkerWebSocket, message: string | ArrayBuffer): void | Promise<void>;
    webSocketClose?(ws: WorkerWebSocket, code: number, reason: string, wasClean: boolean): void | Promise<void>;
    webSocketError?(ws: WorkerWebSocket, error: unknown): void | Promise<void>;
  }

  export const env: WorkerEnv;

  export type {
    D1Database,
    DurableObjectState,
    DurableObjectStub,
    ExecutionContext,
    WorkerEnv,
    WorkerWebSocket,
  };
}

/** Response init accepted by the Workers runtime for a 101 upgrade. */
interface ResponseInit {
  webSocket?: WebSocket;
}

declare const WebSocketPair: {
  new (): { 0: WebSocket; 1: import("cloudflare:workers").WorkerWebSocket };
};

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
    run(): Promise<D1Result>;
  }

  interface D1Database {
    prepare(query: string): D1PreparedStatement;
  }

  interface RateLimit {
    limit(options: { key: string }): Promise<{ success: boolean }>;
  }

  export const env: {
    DB?: D1Database;
    RESULT_LIMITER?: RateLimit;
  };
}

import { getRequestContext } from "@cloudflare/next-on-pages";

// Shared D1 Database types for Cloudflare Workers

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch(statements: D1PreparedStatement[]): Promise<unknown[]>;
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(): Promise<T | null>;
  all<T = unknown>(): Promise<{ results: T[] }>;
  run(): Promise<{ meta: { changes: number } }>;
}

export interface CloudflareEnv {
  DB: D1Database;
  IMAGES?: R2Bucket;
  RESEND_API_KEY?: string;
  APPLE_CLIENT_ID?: string;
  APPLE_TEAM_ID?: string;
  APPLE_KEY_ID?: string;
  APPLE_PRIVATE_KEY?: string;
}

export interface R2Bucket {
  put(
    key: string,
    value: ArrayBuffer | string,
    options?: { httpMetadata?: { contentType?: string; cacheControl?: string } }
  ): Promise<void>;
  get(key: string): Promise<R2ObjectBody | null>;
  delete(key: string): Promise<void>;
  list(options?: { prefix?: string }): Promise<{ objects: { key: string }[] }>;
}

export interface R2ObjectBody {
  body: ReadableStream<Uint8Array> | ArrayBuffer;
  httpMetadata?: {
    contentType?: string;
    cacheControl?: string;
  };
}

// Helper to get Cloudflare environment from request
export function getCloudflareEnv(request: Request): CloudflareEnv | undefined {
  // Try getting it from the request (Edge/Worker native)
  let env = (request as unknown as { cf?: { env?: CloudflareEnv } }).cf?.env;

  // If not found, try getting it from the next-on-pages context (Local Dev / Adapter)
  if (!env) {
    try {
      const context = getRequestContext();
      env = context.env as CloudflareEnv;
    } catch (e) {
      // getRequestContext might fail if not in the right context
      console.warn("Failed to get Cloudflare context:", e);
    }
  }

  return env;
}

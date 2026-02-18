import { Lucia } from "lucia";
import { D1Adapter } from "@lucia-auth/adapter-sqlite";
import type { D1Database } from "./d1-types";

// Declare module augmentation for Lucia
declare module "lucia" {
  interface Register {
    Lucia: ReturnType<typeof initializeLucia>;
    DatabaseUserAttributes: {
      email: string;
      email_verified: number;
    };
  }
}

export function initializeLucia(db: D1Database) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adapter = new D1Adapter(db as any, {
    user: "users",
    session: "sessions",
  });

  return new Lucia(adapter, {
    sessionCookie: {
      name: "auth_session",
      attributes: {
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      },
    },
    getUserAttributes: (attributes) => ({
      email: attributes.email,
      emailVerified: Boolean(attributes.email_verified),
    }),
  });
}

export type Auth = ReturnType<typeof initializeLucia>;

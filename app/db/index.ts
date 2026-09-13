import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import { getDatabaseUrl } from "~/utils/env.server";

// Custom resilient fetch handler with automatic retries for Neon Serverless cold-starts
const resilientFetch = async (input: any, init?: any): Promise<Response> => {
  let attempts = 3;
  let lastError: any = null;
  while (attempts > 0) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
      const response = await fetch(input, {
        ...init,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (err) {
      lastError = err;
      attempts--;
      if (attempts > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1500)); // wait 1.5s before retry
      }
    }
  }
  throw lastError;
};

neonConfig.fetchFunction = resilientFetch;

type Db = ReturnType<typeof drizzle<typeof schema>>;

let _db: Db | null = null;

function getDb(): Db {
  if (!_db) {
    const sql = neon(getDatabaseUrl());
    _db = drizzle({ client: sql, schema });
  }
  return _db;
}

/** Lazy DB proxy — fails with a clear message if DATABASE_URL is missing. */
export const db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    const instance = getDb();
    const value = Reflect.get(instance, prop, receiver);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});

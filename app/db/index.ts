import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

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

// Apply custom fetch handler globally to Neon client
neonConfig.fetchFunction = resilientFetch;

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle({ client: sql, schema });

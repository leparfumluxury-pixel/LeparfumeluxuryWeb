/**
 * Read a required env var or throw a clear error (visible in Vercel logs).
 */
export function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. Add it in Vercel → Project Settings → Environment Variables (Production), then redeploy.`,
    );
  }
  return value;
}

export function getSessionSecret(): string {
  return requireEnv("SESSION_SECRET");
}

/**
 * Neon connection strings often include `channel_binding=require`.
 * Keep sslmode=require; drop channel_binding to avoid proxy/TLS quirks.
 */
export function getDatabaseUrl(): string {
  const raw = requireEnv("DATABASE_URL");
  try {
    const url = new URL(raw);
    url.searchParams.delete("channel_binding");
    if (!url.searchParams.has("sslmode")) {
      url.searchParams.set("sslmode", "require");
    }
    return url.toString();
  } catch {
    return raw;
  }
}

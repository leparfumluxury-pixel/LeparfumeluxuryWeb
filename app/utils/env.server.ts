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

export function getDatabaseUrl(): string {
  return requireEnv("DATABASE_URL");
}

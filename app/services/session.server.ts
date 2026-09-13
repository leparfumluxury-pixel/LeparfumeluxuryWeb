import { createCookieSessionStorage } from "react-router";

type SessionStorage = ReturnType<typeof createCookieSessionStorage>;
let _sessionStorage: SessionStorage | null = null;

function getSessionStorage(): SessionStorage {
  if (!_sessionStorage) {
    const secret = process.env.SESSION_SECRET?.trim();
    if (!secret) {
      throw new Error(
        "Missing required environment variable: SESSION_SECRET. Add it in Vercel → Project Settings → Environment Variables (Production), then redeploy.",
      );
    }
    _sessionStorage = createCookieSessionStorage({
      cookie: {
        name: "__maison_noir_session",
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
        sameSite: "lax",
        secrets: [secret],
        secure: process.env.NODE_ENV === "production",
      },
    });
  }
  return _sessionStorage;
}

export async function getSession(...args: Parameters<SessionStorage["getSession"]>) {
  return getSessionStorage().getSession(...args);
}

export async function commitSession(
  ...args: Parameters<SessionStorage["commitSession"]>
) {
  return getSessionStorage().commitSession(...args);
}

export async function destroySession(
  ...args: Parameters<SessionStorage["destroySession"]>
) {
  return getSessionStorage().destroySession(...args);
}

export const sessionStorage = {
  getSession,
  commitSession,
  destroySession,
};

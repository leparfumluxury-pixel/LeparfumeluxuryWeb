import { createCookieSessionStorage } from "react-router";
import { getSessionSecret } from "~/utils/env.server";

// Validate early so Vercel logs show a clear message instead of a crypto crash.
getSessionSecret();

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__maison_noir_session",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET!],
    secure: process.env.NODE_ENV === "production",
  },
});

export const { getSession, commitSession, destroySession } = sessionStorage;

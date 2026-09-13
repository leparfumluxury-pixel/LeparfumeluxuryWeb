import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "icon", href: "/favicon.ico", sizes: "any" },
  { rel: "icon", href: "/favicon.png", type: "image/png" },
  { rel: "apple-touch-icon", href: "/logo.png" },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="Le Parfume Luxury — Luxury fragrances crafted in Bengaluru. Discover our collection of artisanal perfumes."
        />
        <title>Le Parfume Luxury — Fragrances</title>
        <Meta />
        <Links />
      </head>
      <body className="bg-noir-bg text-cream font-body">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-noir-bg">
      <div className="text-center max-w-lg px-8">
        <h1 className="font-heading text-8xl text-gold mb-4">{message}</h1>
        <p className="text-cream-muted text-lg mb-8">{details}</p>
        {stack && (
          <pre className="w-full p-4 overflow-x-auto text-left bg-noir-surface rounded-lg border border-noir-border text-sm text-cream-muted">
            <code>{stack}</code>
          </pre>
        )}
        <a
          href="/"
          className="inline-block mt-8 px-8 py-3 border border-gold text-gold hover:bg-gold hover:text-noir-bg transition-all duration-300 tracking-widest text-sm uppercase"
        >
          Return Home
        </a>
      </div>
    </main>
  );
}

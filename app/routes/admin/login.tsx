import { Form, redirect, useActionData } from "react-router";
import { login, createUserSession, logout } from "~/services/auth.server";
import { getSession } from "~/services/session.server";

export function meta() {
  return [{ title: "Admin Login — Le Parfume Luxury" }];
}

export async function loader({ request }: { request: Request }) {
  const session = await getSession(request.headers.get("Cookie"));
  if (session.has("userId")) {
    return redirect("/admin");
  }
  return {};
}

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const action = formData.get("_action");

  if (action === "logout") {
    return logout(request);
  }

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const user = await login(email, password);
  if (!user) {
    return { error: "Invalid email or password." };
  }

  return createUserSession(user.id, "/admin");
}

export default function AdminLoginPage() {
  const actionData = useActionData<typeof action>();

  return (
    <div className="min-h-screen bg-noir-bg flex items-center justify-center px-6">
      <div className="w-full max-w-sm animate-fade-in-up">
        {/* Logo */}
        <div className="text-center mb-12">
          <img
            src="/logo.png"
            alt="Le Parfum Luxury"
            className="h-14 w-auto mx-auto"
          />
          <p className="text-[9px] tracking-[0.4em] text-gold uppercase mt-3">
            Admin Portal
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-noir-surface border border-noir-border p-8 rounded-sm">
          <Form method="post" className="space-y-6">
            <div>
              <label className="block text-xs text-cream-muted mb-2 tracking-wider uppercase">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                className="w-full px-4 py-3 bg-noir-bg border border-noir-border text-cream text-sm placeholder:text-cream-dark focus:border-gold focus:outline-none transition-colors"
                placeholder="admin@leparfumeluxury.com"
                id="admin-email"
              />
            </div>
            <div>
              <label className="block text-xs text-cream-muted mb-2 tracking-wider uppercase">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                className="w-full px-4 py-3 bg-noir-bg border border-noir-border text-cream text-sm placeholder:text-cream-dark focus:border-gold focus:outline-none transition-colors"
                placeholder="••••••••"
                id="admin-password"
              />
            </div>

            {actionData?.error && (
              <div className="p-3 border border-red-500/30 bg-red-500/10 text-red-400 text-sm rounded-sm">
                {actionData.error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gold text-noir-bg text-sm tracking-[0.2em] uppercase font-medium hover:bg-gold-light transition-all duration-300"
              id="admin-login-btn"
            >
              Sign In
            </button>
          </Form>
        </div>
      </div>
    </div>
  );
}

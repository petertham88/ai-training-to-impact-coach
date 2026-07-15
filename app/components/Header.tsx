import Link from "next/link";
import { getAuthUser } from "@/lib/auth";

export default async function Header() {
  let user = null as Awaited<ReturnType<typeof getAuthUser>>;
  try {
    user = await getAuthUser();
  } catch {
    // header stays usable even if auth check hiccups
  }

  return (
    <header
      className="sticky top-0 z-20"
      style={{
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between gap-3">
        <div className="flex items-center gap-5">
          <Link href={user ? "/" : "/login"} className="flex items-center gap-2 no-underline">
            <span
              className="grid place-items-center rounded-lg text-white font-bold"
              style={{ background: "var(--brand)", width: 26, height: 26, fontSize: 13 }}
            >
              ✦
            </span>
            <span className="font-bold tracking-tight" style={{ color: "var(--text)" }}>
              Impact Coach
            </span>
          </Link>
          {user && (
            <nav className="hidden sm:flex items-center gap-1 text-sm">
              <NavLink href="/" label="My Workflows" />
              <NavLink href="/playbooks" label="Playbooks" />
              <NavLink href="/manager" label="Manager" />
              <NavLink href="/admin" label="Admin" />
            </nav>
          )}
        </div>

        {user ? (
          <div className="flex items-center gap-2">
            <span className="text-xs muted hidden sm:inline">{user.email}</span>
            <Link href="/account" className="btn btn-ghost" style={{ padding: "0.4rem 0.7rem" }}>
              Account
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/demo" className="btn btn-ghost" style={{ padding: "0.4rem 0.7rem" }}>
              Demo
            </Link>
            <Link href="/login" className="btn btn-primary" style={{ padding: "0.4rem 0.7rem" }}>
              Sign in
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="px-2.5 py-1.5 rounded-md no-underline"
      style={{ color: "var(--muted)", fontWeight: 600 }}
    >
      {label}
    </Link>
  );
}

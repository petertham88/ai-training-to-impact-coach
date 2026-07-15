import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { signIn } from "@/app/auth/actions";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; check_email?: string }>;
}) {
  if (await getAuthUser()) redirect("/");
  const sp = await searchParams;

  return (
    <div className="max-w-sm mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sign in</h1>
        <p className="muted text-sm mt-1">
          Continue building your AI workflows.
        </p>
      </div>

      {sp.check_email && (
        <div className="card p-3 text-sm" style={{ background: "var(--green-tint)", borderColor: "transparent", color: "var(--green)" }}>
          Account created. Check your email to confirm, then sign in.
        </div>
      )}
      {sp.error && (
        <div className="card p-3 text-sm" style={{ background: "var(--red-tint)", borderColor: "transparent", color: "var(--red)" }}>
          {sp.error}
        </div>
      )}

      <form action={signIn} className="card p-5 space-y-4">
        <div>
          <label className="label">Email</label>
          <input name="email" type="email" required className="input" autoComplete="email" />
        </div>
        <div>
          <label className="label">Password</label>
          <input name="password" type="password" required className="input" autoComplete="current-password" />
        </div>
        <button type="submit" className="btn btn-primary w-full">Sign in</button>
      </form>

      <div className="text-sm text-center space-y-2">
        <p className="muted">
          New here? <Link href="/signup" className="link">Create an account</Link>
        </p>
        <p className="muted">
          Just looking? <Link href="/demo" className="link">View the live demo →</Link>
        </p>
      </div>
    </div>
  );
}

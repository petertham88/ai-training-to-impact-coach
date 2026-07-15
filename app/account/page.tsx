import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { getCurrentParticipant } from "@/lib/participant";
import { changePassword, signOut } from "@/app/auth/actions";

export const dynamic = "force-dynamic";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; updated?: string }>;
}) {
  const user = await getAuthUser();
  if (!user) redirect("/login");
  const participant = await getCurrentParticipant();
  const sp = await searchParams;

  return (
    <div className="max-w-md mx-auto space-y-5">
      <div>
        <Link href="/" className="link text-sm">← Back to app</Link>
        <h1 className="text-2xl font-bold tracking-tight mt-2">Account</h1>
        <p className="muted text-sm mt-1">{user.email}</p>
      </div>

      <div className="card p-5 space-y-1">
        <p className="text-sm"><span className="muted">Name:</span> {participant?.full_name ?? "—"}</p>
        <p className="text-sm"><span className="muted">Department:</span> {participant?.department ?? "—"}</p>
        <p className="text-sm"><span className="muted">Cohort:</span> {participant?.cohort ?? "—"}</p>
      </div>

      {/* Change password — available to any signed-in user */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wide muted">Change password</h2>

        {sp.updated && (
          <div className="card p-3 text-sm" style={{ background: "var(--green-tint)", borderColor: "transparent", color: "var(--green)" }}>
            ✓ Password updated.
          </div>
        )}
        {sp.error && (
          <div className="card p-3 text-sm" style={{ background: "var(--red-tint)", borderColor: "transparent", color: "var(--red)" }}>
            {sp.error}
          </div>
        )}

        <form action={changePassword} className="card p-5 space-y-4">
          <div>
            <label className="label">New password</label>
            <input name="password" type="password" required minLength={6} className="input" autoComplete="new-password" />
          </div>
          <div>
            <label className="label">Confirm new password</label>
            <input name="confirm" type="password" required minLength={6} className="input" autoComplete="new-password" />
          </div>
          <button type="submit" className="btn btn-primary w-full">Update password</button>
        </form>
      </div>

      <form action={signOut}>
        <button type="submit" className="btn btn-ghost w-full">Sign out</button>
      </form>
    </div>
  );
}

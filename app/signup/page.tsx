import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { signUp } from "@/app/auth/actions";

export const dynamic = "force-dynamic";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await getAuthUser()) redirect("/");
  const sp = await searchParams;

  return (
    <div className="max-w-md mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
        <p className="muted text-sm mt-1">
          Turn your training into real, measured AI workflows.
        </p>
      </div>

      {sp.error && (
        <div className="card p-3 text-sm" style={{ background: "var(--red-tint)", borderColor: "transparent", color: "var(--red)" }}>
          {sp.error}
        </div>
      )}

      <form action={signUp} className="card p-5 space-y-4">
        <div>
          <label className="label">Full name *</label>
          <input name="full_name" required className="input" autoComplete="name" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Email *</label>
            <input name="email" type="email" required className="input" autoComplete="email" />
          </div>
          <div>
            <label className="label">Password *</label>
            <input name="password" type="password" required minLength={6} className="input" autoComplete="new-password" />
          </div>
          <div>
            <label className="label">Job title</label>
            <input name="job_title" className="input" />
          </div>
          <div>
            <label className="label">Department</label>
            <input name="department" className="input" />
          </div>
        </div>
        <div>
          <label className="label">Cohort</label>
          <input name="cohort" className="input" placeholder="e.g. April 2025 AI Cohort" />
        </div>
        <button type="submit" className="btn btn-primary w-full">Create account</button>
      </form>

      <p className="text-sm text-center muted">
        Already have an account? <Link href="/login" className="link">Sign in</Link>
      </p>
    </div>
  );
}

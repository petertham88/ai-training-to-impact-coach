import Link from "next/link";
import { redirect } from "next/navigation";
import { isTrainer, trainerEmail } from "@/lib/trainer";
import { trainerLogin } from "../actions";

export const dynamic = "force-dynamic";

export default async function TrainerLogin({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await isTrainer()) redirect("/admin");
  const sp = await searchParams;

  return (
    <div className="max-w-sm mx-auto space-y-5">
      <div>
        <Link href="/" className="link text-sm">← Back to app</Link>
        <h1 className="text-2xl font-bold tracking-tight mt-2">Trainer sign-in</h1>
        <p className="muted text-sm mt-1">
          The admin panel is restricted to the training program&rsquo;s trainer.
        </p>
      </div>

      {sp.error && (
        <div className="card p-3 text-sm" style={{ background: "var(--red-tint)", borderColor: "transparent", color: "var(--red)" }}>
          Incorrect email or passcode.
        </div>
      )}

      <form action={trainerLogin} className="card p-5 space-y-4">
        <div>
          <label className="label">Trainer email</label>
          <input name="email" type="email" required className="input" placeholder={trainerEmail()} />
        </div>
        <div>
          <label className="label">Passcode</label>
          <input name="passcode" type="password" required className="input" />
        </div>
        <button type="submit" className="btn btn-primary w-full">Sign in</button>
        <p className="text-xs muted text-center">
          Demo trainer: <code>{trainerEmail()}</code> · passcode <code>impact2025</code>
        </p>
      </form>
    </div>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentParticipant } from "@/lib/participant";
import { createWorkProblem } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function NewProblemPage() {
  const participant = await getCurrentParticipant();
  if (!participant) redirect("/login");

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <Link href="/" className="link text-sm">
          ← Back
        </Link>
        <h1 className="text-2xl font-bold tracking-tight mt-2">
          Step 1 · Describe your work problem
        </h1>
        <p className="muted text-sm mt-1">
          Pick a real, recurring task from your job that eats time. Be specific
          — the whole workflow builds on this.
        </p>
      </div>

      <form action={createWorkProblem} className="card p-5 space-y-4">
        <input type="hidden" name="participant_id" value={participant.id} />

        <div>
          <label className="label" htmlFor="title">
            What&rsquo;s the task? *
          </label>
          <input
            id="title"
            name="title"
            required
            className="input"
            placeholder="e.g. Weekly ops status report"
          />
        </div>

        <div>
          <label className="label" htmlFor="description">
            Describe it
          </label>
          <textarea
            id="description"
            name="description"
            className="textarea"
            placeholder="What makes it slow or painful today?"
          />
        </div>

        <div>
          <label className="label" htmlFor="current_process">
            How do you do it now?
          </label>
          <textarea
            id="current_process"
            name="current_process"
            className="textarea"
            placeholder="The current step-by-step process"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="frequency">
              How often?
            </label>
            <input
              id="frequency"
              name="frequency"
              className="input"
              placeholder="Daily / Weekly / Monthly"
            />
          </div>
          <div>
            <label className="label" htmlFor="estimated_time_per_week_hours">
              Hours per week
            </label>
            <input
              id="estimated_time_per_week_hours"
              name="estimated_time_per_week_hours"
              type="number"
              step="0.5"
              min="0"
              className="input"
              placeholder="e.g. 3"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Link href="/" className="btn btn-ghost">
            Cancel
          </Link>
          <button type="submit" className="btn btn-primary">
            Create &amp; continue →
          </button>
        </div>
      </form>
    </div>
  );
}

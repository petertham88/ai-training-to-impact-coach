import Link from "next/link";
import { createParticipant } from "@/app/actions";

export const dynamic = "force-dynamic";

export default function NewParticipantPage() {
  return (
    <div className="max-w-xl mx-auto space-y-5">
      <div>
        <Link href="/" className="link text-sm">
          ← Back
        </Link>
        <h1 className="text-2xl font-bold tracking-tight mt-2">
          Add a participant
        </h1>
        <p className="muted text-sm mt-1">
          Someone from an AI training cohort who&rsquo;ll build real workflows.
        </p>
      </div>

      <form action={createParticipant} className="card p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="full_name">
              Full name *
            </label>
            <input id="full_name" name="full_name" required className="input" />
          </div>
          <div>
            <label className="label" htmlFor="email">
              Email *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="input"
            />
          </div>
          <div>
            <label className="label" htmlFor="job_title">
              Job title
            </label>
            <input id="job_title" name="job_title" className="input" />
          </div>
          <div>
            <label className="label" htmlFor="department">
              Department
            </label>
            <input id="department" name="department" className="input" />
          </div>
          <div>
            <label className="label" htmlFor="manager_email">
              Manager email
            </label>
            <input
              id="manager_email"
              name="manager_email"
              type="email"
              className="input"
            />
          </div>
          <div>
            <label className="label" htmlFor="cohort">
              Cohort
            </label>
            <input
              id="cohort"
              name="cohort"
              className="input"
              placeholder="e.g. April 2025 AI Cohort"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Link href="/" className="btn btn-ghost">
            Cancel
          </Link>
          <button type="submit" className="btn btn-primary">
            Create participant
          </button>
        </div>
      </form>
    </div>
  );
}

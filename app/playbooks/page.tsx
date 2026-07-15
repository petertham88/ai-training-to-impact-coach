import Link from "next/link";
import { getAllPlaybooks, getParticipant, getOutcomeForPlaybook } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function PlaybooksPage() {
  const playbooks = await getAllPlaybooks();
  const enriched = await Promise.all(
    playbooks.map(async (pb) => ({
      pb,
      participant: await getParticipant(pb.participant_id),
      outcome: await getOutcomeForPlaybook(pb.id),
    })),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Playbook library</h1>
        <p className="muted text-sm mt-1">
          Reusable AI workflows the cohort has tested and proven.
        </p>
      </div>

      {enriched.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="font-semibold mb-1">No playbooks yet</p>
          <p className="muted text-sm">
            Complete a workflow through Step 5 to publish a playbook here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {enriched.map(({ pb, participant, outcome }) => (
            <Link
              key={pb.id}
              href={`/playbooks/${pb.id}`}
              className="card p-4 block no-underline hover:shadow-sm"
              style={{ color: "var(--text)" }}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className={`badge ${pb.status === "active" ? "badge-green" : ""}`}>
                  {pb.status}
                </span>
                {outcome?.time_saved_per_week_hours != null && (
                  <span className="badge badge-brand">
                    {outcome.time_saved_per_week_hours}h/wk saved
                  </span>
                )}
              </div>
              <h3 className="font-semibold">{pb.title}</h3>
              <p className="muted text-xs mt-1">
                {participant?.full_name ?? "—"}
                {participant?.department ? ` · ${participant.department}` : ""}
              </p>
              {outcome?.business_result && (
                <p className="text-sm mt-2 line-clamp-2">{outcome.business_result}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

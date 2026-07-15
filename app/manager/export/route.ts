import { getOutcomeRows } from "@/lib/queries";

export const dynamic = "force-dynamic";

function csvCell(v: unknown): string {
  const s = v == null ? "" : String(v);
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET() {
  const rows = await getOutcomeRows();
  const header = [
    "participant",
    "email",
    "department",
    "cohort",
    "playbook",
    "time_saved_per_week_hours",
    "confidence_level",
    "quality_improvement",
    "business_result",
    "measurement_method",
    "verified_by_manager",
  ];
  const lines = [header.map(csvCell).join(",")];
  for (const { outcome, participant, playbookTitle } of rows) {
    lines.push(
      [
        participant?.full_name,
        participant?.email,
        participant?.department,
        participant?.cohort,
        playbookTitle,
        outcome.time_saved_per_week_hours,
        outcome.confidence_level,
        outcome.quality_improvement,
        outcome.business_result,
        outcome.measurement_method,
        outcome.verified_by_manager,
      ]
        .map(csvCell)
        .join(","),
    );
  }
  const csv = lines.join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="outcomes.csv"',
    },
  });
}

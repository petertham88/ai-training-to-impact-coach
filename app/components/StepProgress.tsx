import Link from "next/link";
import { STEPS } from "@/lib/types";

// Visual 6-step indicator. Reflects real DB state (completedThrough) — not cosmetic.
export default function StepProgress({
  completedThrough,
  currentStep,
  workProblemId,
  activeStep,
  compact = false,
}: {
  completedThrough: number;
  currentStep: number;
  workProblemId?: string;
  activeStep?: number;
  compact?: boolean;
}) {
  return (
    <div className={`flex items-center ${compact ? "gap-1" : "gap-1.5"}`}>
      {STEPS.map((s, i) => {
        const done = s.n <= completedThrough;
        const isCurrent = s.n === currentStep;
        const isActive = s.n === activeStep;
        const reachable = s.n <= currentStep; // can't skip ahead of what's unlocked

        const dot = (
          <div className="flex flex-col items-center gap-1" style={{ minWidth: compact ? 18 : 34 }}>
            <div
              className="grid place-items-center rounded-full font-bold"
              style={{
                width: compact ? 18 : 30,
                height: compact ? 18 : 30,
                fontSize: compact ? 10 : 13,
                background: done
                  ? "var(--green)"
                  : isActive || isCurrent
                    ? "var(--brand)"
                    : "var(--surface-2)",
                color: done || isActive || isCurrent ? "#fff" : "var(--muted)",
                border: isActive ? "2px solid var(--brand-600)" : "1px solid var(--border)",
              }}
            >
              {done ? "✓" : s.n}
            </div>
            {!compact && (
              <span
                className="text-[10px] font-semibold text-center leading-tight"
                style={{ color: isActive || isCurrent ? "var(--brand)" : "var(--muted)" }}
              >
                {s.label}
              </span>
            )}
          </div>
        );

        return (
          <div key={s.key} className="flex items-center" style={{ flex: i < STEPS.length - 1 ? "1 1 0" : "0 0 auto" }}>
            {workProblemId && reachable ? (
              <Link href={`/problems/${workProblemId}?step=${s.n}`} className="no-underline">
                {dot}
              </Link>
            ) : (
              dot
            )}
            {i < STEPS.length - 1 && (
              <div
                className="flex-1 mx-1 rounded"
                style={{
                  height: 3,
                  minWidth: compact ? 10 : 16,
                  marginBottom: compact ? 0 : 18,
                  background: s.n < completedThrough ? "var(--green)" : "var(--border)",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

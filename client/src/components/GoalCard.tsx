import { Link } from "wouter";
import { Calendar, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { getProgressPercent, getStatusColor, getProgressBarColor, getLevelColor } from "@/lib/api";
import type { Goal } from "@/lib/api";

interface GoalCardProps {
  goal: Goal;
  compact?: boolean;
}

export default function GoalCard({ goal, compact = false }: GoalCardProps) {
  const pct = getProgressPercent(goal);

  return (
    <Link href={`/goals/${goal.goalID}`}>
      <div
        className="group bg-card border border-card-border rounded-lg p-4 hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer"
        data-testid={`goal-card-${goal.goalID}`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border capitalize", getLevelColor(goal.level))}>
                {goal.level}
              </span>
              <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border", getStatusColor(goal.status))}>
                {goal.status ?? "—"}
              </span>
            </div>
            <h3 className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
              {goal.name}
            </h3>
          </div>
          <ChevronRight size={14} className="text-muted-foreground flex-shrink-0 mt-1 group-hover:text-primary transition-colors" />
        </div>

        {!compact && (
          <>
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Progress</span>
                <span className="text-xs font-semibold tabular-nums" data-testid={`goal-pct-${goal.goalID}`}>
                  {pct}%
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all", getProgressBarColor(goal.status))}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-muted-foreground tabular-nums">
                  {goal.currentValue?.toLocaleString()} / {goal.targetValue?.toLocaleString()} {goal.unitOfMeasure}
                </span>
              </div>
            </div>

            {(goal.startDate || goal.endDate) && (
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <Calendar size={11} />
                <span>{goal.startDate} – {goal.endDate}</span>
              </div>
            )}
          </>
        )}
      </div>
    </Link>
  );
}

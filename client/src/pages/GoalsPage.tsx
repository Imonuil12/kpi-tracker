import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchGoals, fetchCompanies, fetchDepartments, fetchTeams, fetchEmployees, deleteGoal, getLevelColor, getStatusColor, getProgressPercent, getProgressBarColor } from "@/lib/api";
import type { Goal } from "@/lib/api";
import { Link } from "wouter";
import { Plus, Filter, ChevronRight, Trash2, Edit2, Building2, Layers, Target, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import GoalFormDialog from "@/components/GoalFormDialog";
import { cn } from "@/lib/utils";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";

const LEVEL_ORDER = ["company", "department", "team", "employee"];

const LEVEL_ICONS: Record<string, any> = {
  company: Building2,
  department: Layers,
  team: Target,
  employee: Users,
};

function GoalRow({ goal, onEdit, onDelete }: { goal: Goal; onEdit: (g: Goal) => void; onDelete: (g: Goal) => void }) {
  const pct = getProgressPercent(goal);
  const Icon = LEVEL_ICONS[goal.level] || Target;

  return (
    <div className="group flex items-center gap-3 px-4 py-3 hover:bg-accent/40 transition-colors border-b border-border last:border-0">
      <div className={cn("p-1.5 rounded-md flex-shrink-0", getLevelColor(goal.level).replace("text-", "text-").split(" ").filter(c => c.includes("bg-") || c.includes("text-")).join(" "))}>
        <Icon size={13} />
      </div>
      <div className="flex-1 min-w-0">
        <Link href={`/goals/${goal.goalID}`}>
          <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors cursor-pointer truncate block" data-testid={`goal-name-${goal.goalID}`}>
            {goal.name}
          </span>
        </Link>
        <div className="flex items-center gap-3 mt-0.5">
          <div className="flex items-center gap-1.5">
            <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden flex-shrink-0">
              <div className={cn("h-full rounded-full", getProgressBarColor(goal.status))} style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs text-muted-foreground tabular-nums">{pct}%</span>
          </div>
          <span className="text-xs text-muted-foreground tabular-nums hidden sm:block">
            {goal.currentValue?.toLocaleString()} / {goal.targetValue?.toLocaleString()} {goal.unitOfMeasure}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border hidden sm:block", getStatusColor(goal.status))}>
          {goal.status}
        </span>
        <button
          onClick={() => onEdit(goal)}
          className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent opacity-0 group-hover:opacity-100 transition-all"
          data-testid={`btn-edit-goal-${goal.goalID}`}
        >
          <Edit2 size={13} />
        </button>
        <button
          onClick={() => onDelete(goal)}
          className="p-1.5 rounded text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 opacity-0 group-hover:opacity-100 transition-all"
          data-testid={`btn-delete-goal-${goal.goalID}`}
        >
          <Trash2 size={13} />
        </button>
        <Link href={`/goals/${goal.goalID}`}>
          <ChevronRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
        </Link>
      </div>
    </div>
  );
}

export default function GoalsPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editGoal, setEditGoal] = useState<Goal | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Goal | null>(null);
  const [filterLevel, setFilterLevel] = useState<string>("all");

  const { data: goals = [], isLoading } = useQuery({ queryKey: ["/api/goals"], queryFn: fetchGoals });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteGoal(id).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({ title: "Goal deleted" });
      setDeleteTarget(null);
    },
    onError: () => toast({ title: "Error deleting goal", variant: "destructive" }),
  });

  const filtered = filterLevel === "all" ? goals : goals.filter(g => g.level === filterLevel);
  const grouped = LEVEL_ORDER.reduce<Record<string, Goal[]>>((acc, lvl) => {
    const items = filtered.filter(g => g.level === lvl);
    if (items.length) acc[lvl] = items;
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-screen-xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground" data-testid="page-title-goals">Goals</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{goals.length} total goals across all levels</p>
        </div>
        <Button onClick={() => { setEditGoal(null); setFormOpen(true); }} size="sm" data-testid="btn-create-goal">
          <Plus size={14} className="mr-1.5" /> New Goal
        </Button>
      </div>

      {/* Level filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={13} className="text-muted-foreground" />
        {["all", ...LEVEL_ORDER].map(lvl => (
          <button
            key={lvl}
            onClick={() => setFilterLevel(lvl)}
            className={cn(
              "text-xs font-medium px-3 py-1 rounded-full border transition-colors capitalize",
              filterLevel === lvl
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
            )}
            data-testid={`filter-${lvl}`}
          >
            {lvl}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Target size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No goals found</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => setFormOpen(true)}>Create your first goal</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([level, items]) => {
            const Icon = LEVEL_ICONS[level] || Target;
            return (
              <div key={level} className="bg-card border border-card-border rounded-lg overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/30">
                  <Icon size={13} className="text-muted-foreground" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground capitalize">{level} Goals</span>
                  <span className="text-xs text-muted-foreground ml-auto">{items.length}</span>
                </div>
                {items.map(g => (
                  <GoalRow
                    key={g.goalID}
                    goal={g}
                    onEdit={(g) => { setEditGoal(g); setFormOpen(true); }}
                    onDelete={setDeleteTarget}
                  />
                ))}
              </div>
            );
          })}
        </div>
      )}

      <GoalFormDialog
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditGoal(null); }}
        editGoal={editGoal}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete goal?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteTarget?.name}" will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.goalID)}
              data-testid="btn-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

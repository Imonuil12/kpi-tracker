import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchGoals, fetchCompanies, fetchDepartments, fetchTeams, fetchEmployees, deleteGoal, getProgressPercent, getStatusColor, getProgressBarColor, getLevelColor } from "@/lib/api";
import type { Goal, Company, Department, Team, Employee } from "@/lib/api";
import { Link } from "wouter";
import { ArrowLeft, Edit2, Trash2, Calendar, Target, DollarSign, Lightbulb, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import GoalFormDialog from "@/components/GoalFormDialog";
import { cn } from "@/lib/utils";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";

export default function GoalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: goals = [], isLoading } = useQuery({ queryKey: ["/api/goals"], queryFn: fetchGoals });
  const { data: companies = [] } = useQuery({ queryKey: ["/api/companies"], queryFn: fetchCompanies });
  const { data: departments = [] } = useQuery({ queryKey: ["/api/departments"], queryFn: fetchDepartments });
  const { data: teams = [] } = useQuery({ queryKey: ["/api/teams"], queryFn: fetchTeams });
  const { data: employees = [] } = useQuery({ queryKey: ["/api/employees"], queryFn: fetchEmployees });

  const goal = goals.find(g => g.goalID === parseInt(id ?? ""));

  const deleteMutation = useMutation({
    mutationFn: () => deleteGoal(parseInt(id!)).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({ title: "Goal deleted" });
      navigate("/goals");
    },
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Goal not found.</p>
        <Link href="/goals"><Button variant="outline" size="sm" className="mt-3">Back to Goals</Button></Link>
      </div>
    );
  }

  const pct = getProgressPercent(goal);

  const ownerName = (() => {
    if (goal.level === "company") return companies.find(c => c.companyID === goal.companyID)?.name ?? "—";
    if (goal.level === "department") return departments.find(d => d.depID === goal.depID)?.name ?? "—";
    if (goal.level === "team") return teams.find(t => t.teamID === goal.teamID)?.name ?? "—";
    if (goal.level === "employee") {
      const emp = employees.find(e => e.employeeID === goal.employeeID);
      return emp ? `${emp.firstName} ${emp.lastName}` : "—";
    }
    return "—";
  })();

  // Related goals at the same level
  const relatedGoals = goals.filter(g => g.goalID !== goal.goalID && g.level === goal.level).slice(0, 4);

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-5">
      {/* Back nav */}
      <div className="flex items-center justify-between">
        <Link href="/goals">
          <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={14} /> Goals
          </button>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditing(true)} data-testid="btn-edit-goal-detail">
            <Edit2 size={13} className="mr-1.5" /> Edit
          </Button>
          <Button variant="outline" size="sm" onClick={() => setConfirmDelete(true)} className="text-destructive border-destructive/30 hover:bg-destructive/10" data-testid="btn-delete-goal-detail">
            <Trash2 size={13} className="mr-1.5" /> Delete
          </Button>
        </div>
      </div>

      {/* Main card */}
      <div className="bg-card border border-card-border rounded-lg p-5 space-y-5">
        {/* Title + badges */}
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border capitalize", getLevelColor(goal.level))}>{goal.level}</span>
            <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border", getStatusColor(goal.status))}>{goal.status}</span>
          </div>
          <h1 className="text-xl font-bold text-foreground" data-testid="goal-detail-name">{goal.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">Owned by <span className="font-medium text-foreground">{ownerName}</span></p>
        </div>

        {/* Progress */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-medium text-foreground">Progress</span>
            <span className="text-sm font-bold tabular-nums text-foreground" data-testid="goal-detail-pct">{pct}%</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-500", getProgressBarColor(goal.status))}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-xs text-muted-foreground">Current: <span className="font-semibold tabular-nums text-foreground">{goal.currentValue?.toLocaleString()}</span></span>
            <span className="text-xs text-muted-foreground">Target: <span className="font-semibold tabular-nums text-foreground">{goal.targetValue?.toLocaleString()} {goal.unitOfMeasure}</span></span>
          </div>
        </div>

        {/* Metadata grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/40 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-0.5">
              <Calendar size={12} /> Timeline
            </div>
            <p className="text-sm font-medium text-foreground tabular-nums">
              {goal.startDate ?? "—"} – {goal.endDate ?? "—"}
            </p>
          </div>
          <div className="bg-muted/40 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-0.5">
              <Target size={12} /> Unit
            </div>
            <p className="text-sm font-medium text-foreground">{goal.unitOfMeasure ?? "—"}</p>
          </div>
        </div>

        {/* Level-specific fields */}
        {goal.level === "company" && goal.strategy && (
          <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-xs font-medium text-purple-700 dark:text-purple-400 mb-1.5">
              <Lightbulb size={12} /> Strategy
            </div>
            <p className="text-sm text-foreground">{goal.strategy}</p>
          </div>
        )}
        {goal.level === "department" && goal.budget != null && (
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-xs font-medium text-blue-700 dark:text-blue-400 mb-1.5">
              <DollarSign size={12} /> Budget
            </div>
            <p className="text-sm font-semibold tabular-nums text-foreground">${goal.budget?.toLocaleString()}</p>
          </div>
        )}
        {goal.level === "employee" && goal.smartGoal && (
          <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-xs font-medium text-orange-700 dark:text-orange-400 mb-1.5">
              <Lightbulb size={12} /> SMART Goal
            </div>
            <p className="text-sm text-foreground">{goal.smartGoal}</p>
          </div>
        )}
      </div>

      {/* Related goals */}
      {relatedGoals.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3 capitalize">Other {goal.level} Goals</h2>
          <div className="space-y-2">
            {relatedGoals.map(rg => {
              const rpct = getProgressPercent(rg);
              return (
                <Link key={rg.goalID} href={`/goals/${rg.goalID}`}>
                  <div className="bg-card border border-card-border rounded-lg px-4 py-3 flex items-center gap-3 hover:border-primary/40 transition-colors cursor-pointer">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate hover:text-primary transition-colors">{rg.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className={cn("h-full rounded-full", getProgressBarColor(rg.status))} style={{ width: `${rpct}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground tabular-nums">{rpct}%</span>
                      </div>
                    </div>
                    <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border flex-shrink-0", getStatusColor(rg.status))}>
                      {rg.status}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <GoalFormDialog open={editing} onClose={() => setEditing(false)} editGoal={goal} />

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete goal?</AlertDialogTitle>
            <AlertDialogDescription>"{goal.name}" will be permanently deleted.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteMutation.mutate()}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { fetchGoals, fetchCompanies, fetchDepartments, fetchTeams, fetchEmployees, getProgressPercent, getStatusColor, getProgressBarColor } from "@/lib/api";
import type { Goal } from "@/lib/api";
import { Link } from "wouter";
import { Target, Building2, Layers, Users, TrendingUp, AlertTriangle, CheckCircle2, Clock, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

function KpiCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color: string }) {
  return (
    <div className="bg-card border border-card-border rounded-lg p-4" data-testid={`kpi-${label.toLowerCase().replace(/\s/g, '-')}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
        <div className={cn("p-1.5 rounded-md", color)}>
          <Icon size={14} />
        </div>
      </div>
      <div className="text-2xl font-bold tabular-nums text-foreground">{value}</div>
    </div>
  );
}

function StatusRow({ goal }: { goal: Goal }) {
  const pct = getProgressPercent(goal);
  return (
    <Link href={`/goals/${goal.goalID}`}>
      <div className="flex items-center gap-3 py-2.5 px-3 rounded-md hover:bg-accent/50 transition-colors cursor-pointer group" data-testid={`status-row-${goal.goalID}`}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">{goal.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden max-w-48">
              <div className={cn("h-full rounded-full", getProgressBarColor(goal.status))} style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs text-muted-foreground tabular-nums flex-shrink-0">{pct}%</span>
          </div>
        </div>
        <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border flex-shrink-0", getStatusColor(goal.status))}>
          {goal.status}
        </span>
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const { data: goals = [], isLoading: gLoading } = useQuery({ queryKey: ["/api/goals"], queryFn: fetchGoals });
  const { data: companies = [] } = useQuery({ queryKey: ["/api/companies"], queryFn: fetchCompanies });
  const { data: departments = [] } = useQuery({ queryKey: ["/api/departments"], queryFn: fetchDepartments });
  const { data: teams = [] } = useQuery({ queryKey: ["/api/teams"], queryFn: fetchTeams });
  const { data: employees = [] } = useQuery({ queryKey: ["/api/employees"], queryFn: fetchEmployees });

  const statusCounts = {
    achieved: goals.filter(g => g.status === "Achieved").length,
    onTrack: goals.filter(g => g.status === "On Track").length,
    inProgress: goals.filter(g => g.status === "In Progress").length,
    behind: goals.filter(g => g.status === "Behind").length,
    notStarted: goals.filter(g => g.status === "Not Started").length,
  };

  const atRisk = goals.filter(g => g.status === "Behind" || g.status === "Not Started").slice(0, 5);
  const recentGoals = [...goals].slice(0, 6);

  if (gLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-screen-xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground" data-testid="page-title-dashboard">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Overview of all goals and KPIs across your organization</p>
      </div>

      {/* Org KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Companies" value={companies.length} icon={Building2} color="bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400" />
        <KpiCard label="Departments" value={departments.length} icon={Layers} color="bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400" />
        <KpiCard label="Teams" value={teams.length} icon={Target} color="bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400" />
        <KpiCard label="Employees" value={employees.length} icon={Users} color="bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400" />
      </div>

      {/* Goal Status Cards — all 5 statuses */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-3 flex items-center gap-2.5">
          <CheckCircle2 size={18} className="text-green-600 dark:text-green-400 flex-shrink-0" />
          <div>
            <div className="text-xl font-bold tabular-nums text-green-700 dark:text-green-300">{statusCounts.achieved}</div>
            <div className="text-xs text-green-600 dark:text-green-400">Achieved</div>
          </div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-center gap-2.5">
          <TrendingUp size={18} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <div>
            <div className="text-xl font-bold tabular-nums text-blue-700 dark:text-blue-300">{statusCounts.onTrack}</div>
            <div className="text-xs text-blue-600 dark:text-blue-400">On Track</div>
          </div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 flex items-center gap-2.5">
          <Activity size={18} className="text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
          <div>
            <div className="text-xl font-bold tabular-nums text-yellow-700 dark:text-yellow-300">{statusCounts.inProgress}</div>
            <div className="text-xs text-yellow-600 dark:text-yellow-400">In Progress</div>
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-center gap-2.5">
          <AlertTriangle size={18} className="text-red-600 dark:text-red-400 flex-shrink-0" />
          <div>
            <div className="text-xl font-bold tabular-nums text-red-700 dark:text-red-300">{statusCounts.behind}</div>
            <div className="text-xs text-red-600 dark:text-red-400">Behind</div>
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 flex items-center gap-2.5">
          <Clock size={18} className="text-gray-500 flex-shrink-0" />
          <div>
            <div className="text-xl font-bold tabular-nums text-gray-700 dark:text-gray-300">{statusCounts.notStarted}</div>
            <div className="text-xs text-gray-500">Not Started</div>
          </div>
        </div>
      </div>

      {/* Two-column section */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* At-risk goals */}
        <div className="bg-card border border-card-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle size={14} className="text-red-500" /> Behind or Not Started
            </h2>
            <Link href="/goals" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          {atRisk.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No at-risk goals 🎉</p>
          ) : (
            <div className="space-y-0.5">
              {atRisk.map(g => <StatusRow key={g.goalID} goal={g} />)}
            </div>
          )}
        </div>

        {/* All goals quick list */}
        <div className="bg-card border border-card-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Target size={14} className="text-primary" /> All Goals
            </h2>
            <Link href="/goals" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          {recentGoals.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No goals yet</p>
          ) : (
            <div className="space-y-0.5">
              {recentGoals.map(g => <StatusRow key={g.goalID} goal={g} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchCompanies, fetchDepartments, fetchTeams, fetchEmployees, createCompany, createDepartment, createTeam, createEmployee, deleteCompany, deleteDepartment, deleteTeam, deleteEmployee } from "@/lib/api";
import type { Company, Department, Team, Employee } from "@/lib/api";
import { Building2, Layers, Target, Users, ChevronRight, ChevronDown, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";

type AddType = "company" | "department" | "team" | "employee" | null;

function EmployeeBadge({ emp }: { emp: Employee }) {
  const initials = `${emp.firstName[0]}${emp.lastName[0]}`;
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs hover:bg-accent/50 transition-colors" data-testid={`employee-${emp.employeeID}`}>
      <div className="w-6 h-6 rounded-full bg-primary/15 text-primary flex items-center justify-center font-semibold text-xs flex-shrink-0">
        {initials}
      </div>
      <span className="text-foreground">{emp.firstName} {emp.lastName}</span>
      <span className="text-muted-foreground ml-auto">{emp.email}</span>
    </div>
  );
}

export default function OrgPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [expandedCompanies, setExpandedCompanies] = useState<Set<number>>(new Set([1, 2]));
  const [expandedDepts, setExpandedDepts] = useState<Set<number>>(new Set([1, 2, 3]));
  const [expandedTeams, setExpandedTeams] = useState<Set<number>>(new Set([1, 2, 3, 4]));
  const [addType, setAddType] = useState<AddType>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: number; name: string } | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formFirstName, setFormFirstName] = useState("");
  const [formLastName, setFormLastName] = useState("");
  const [formParentId, setFormParentId] = useState<number | null>(null);

  const { data: companies = [], isLoading } = useQuery({ queryKey: ["/api/companies"], queryFn: fetchCompanies });
  const { data: departments = [] } = useQuery({ queryKey: ["/api/departments"], queryFn: fetchDepartments });
  const { data: teams = [] } = useQuery({ queryKey: ["/api/teams"], queryFn: fetchTeams });
  const { data: employees = [] } = useQuery({ queryKey: ["/api/employees"], queryFn: fetchEmployees });

  const addMutation = useMutation({
    mutationFn: async () => {
      if (addType === "company") return createCompany({ name: formName }).then(r => r.json());
      if (addType === "department") return createDepartment({ name: formName, companyID: formParentId! }).then(r => r.json());
      if (addType === "team") return createTeam({ name: formName, depID: formParentId! }).then(r => r.json());
      if (addType === "employee") return createEmployee({ firstName: formFirstName, lastName: formLastName, email: formEmail, teamID: formParentId ?? undefined }).then(r => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/companies"] });
      qc.invalidateQueries({ queryKey: ["/api/departments"] });
      qc.invalidateQueries({ queryKey: ["/api/teams"] });
      qc.invalidateQueries({ queryKey: ["/api/employees"] });
      toast({ title: `${addType?.charAt(0).toUpperCase()}${addType?.slice(1)} added` });
      setAddType(null);
      setFormName(""); setFormEmail(""); setFormFirstName(""); setFormLastName(""); setFormParentId(null);
    },
    onError: () => toast({ title: "Error adding entry", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!deleteTarget) return;
      if (deleteTarget.type === "company") return deleteCompany(deleteTarget.id).then(r => r.json());
      if (deleteTarget.type === "department") return deleteDepartment(deleteTarget.id).then(r => r.json());
      if (deleteTarget.type === "team") return deleteTeam(deleteTarget.id).then(r => r.json());
      if (deleteTarget.type === "employee") return deleteEmployee(deleteTarget.id).then(r => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/companies"] });
      qc.invalidateQueries({ queryKey: ["/api/departments"] });
      qc.invalidateQueries({ queryKey: ["/api/teams"] });
      qc.invalidateQueries({ queryKey: ["/api/employees"] });
      toast({ title: "Deleted successfully" });
      setDeleteTarget(null);
    },
  });

  const toggleCompany = (id: number) => setExpandedCompanies(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleDept = (id: number) => setExpandedDepts(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleTeam = (id: number) => setExpandedTeams(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  if (isLoading) return (
    <div className="p-6 space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
  );

  return (
    <div className="p-6 max-w-screen-xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground" data-testid="page-title-org">Organization</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Hierarchical view of your org structure</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setAddType("company")} data-testid="btn-add-company">
            <Plus size={13} className="mr-1.5" /> Company
          </Button>
          <Button size="sm" onClick={() => setAddType("employee")} data-testid="btn-add-employee">
            <Plus size={13} className="mr-1.5" /> Employee
          </Button>
        </div>
      </div>

      {/* Org Tree */}
      <div className="space-y-3">
        {companies.map(co => {
          const compDepts = departments.filter(d => d.companyID === co.companyID);
          const expanded = expandedCompanies.has(co.companyID);

          return (
            <div key={co.companyID} className="bg-card border border-card-border rounded-lg overflow-hidden" data-testid={`company-${co.companyID}`}>
              {/* Company row */}
              <div className="flex items-center gap-2 px-4 py-3 bg-purple-50/50 dark:bg-purple-950/20 border-b border-purple-100 dark:border-purple-900/50">
                <button onClick={() => toggleCompany(co.companyID)} className="flex items-center gap-2 flex-1 min-w-0">
                  {expanded ? <ChevronDown size={14} className="text-purple-500 flex-shrink-0" /> : <ChevronRight size={14} className="text-purple-500 flex-shrink-0" />}
                  <Building2 size={14} className="text-purple-600 dark:text-purple-400 flex-shrink-0" />
                  <span className="text-sm font-semibold text-foreground">{co.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">{co.mainAddress}</span>
                </button>
                <div className="flex items-center gap-1">
                  <button onClick={() => { setAddType("department"); setFormParentId(co.companyID); }} className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" title="Add department">
                    <Plus size={12} />
                  </button>
                  <button onClick={() => setDeleteTarget({ type: "company", id: co.companyID, name: co.name })} className="p-1.5 rounded text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {expanded && (
                <div className="divide-y divide-border">
                  {compDepts.map(dep => {
                    const depTeams = teams.filter(t => t.depID === dep.depID);
                    const deptExpanded = expandedDepts.has(dep.depID);

                    return (
                      <div key={dep.depID} data-testid={`dept-${dep.depID}`}>
                        {/* Department row */}
                        <div className="flex items-center gap-2 px-6 py-2.5 bg-blue-50/30 dark:bg-blue-950/10">
                          <button onClick={() => toggleDept(dep.depID)} className="flex items-center gap-2 flex-1 min-w-0">
                            {deptExpanded ? <ChevronDown size={13} className="text-blue-500 flex-shrink-0" /> : <ChevronRight size={13} className="text-blue-500 flex-shrink-0" />}
                            <Layers size={13} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
                            <span className="text-sm font-medium text-foreground">{dep.name}</span>
                            {dep.location && <span className="text-xs text-muted-foreground ml-2">· {dep.location}</span>}
                          </button>
                          <div className="flex items-center gap-1">
                            <button onClick={() => { setAddType("team"); setFormParentId(dep.depID); }} className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" title="Add team">
                              <Plus size={11} />
                            </button>
                            <button onClick={() => setDeleteTarget({ type: "department", id: dep.depID, name: dep.name })} className="p-1.5 rounded text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors">
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>

                        {deptExpanded && depTeams.map(tm => {
                          const tmEmps = employees.filter(e => e.teamID === tm.teamID);
                          const teamExpanded = expandedTeams.has(tm.teamID);

                          return (
                            <div key={tm.teamID} data-testid={`team-${tm.teamID}`}>
                              {/* Team row */}
                              <div className="flex items-center gap-2 px-10 py-2">
                                <button onClick={() => toggleTeam(tm.teamID)} className="flex items-center gap-2 flex-1 min-w-0">
                                  {teamExpanded ? <ChevronDown size={12} className="text-teal-500 flex-shrink-0" /> : <ChevronRight size={12} className="text-teal-500 flex-shrink-0" />}
                                  <Target size={12} className="text-teal-600 dark:text-teal-400 flex-shrink-0" />
                                  <span className="text-sm text-foreground font-medium">{tm.name}</span>
                                  <span className="text-xs text-muted-foreground ml-2">{tmEmps.length} member{tmEmps.length !== 1 ? "s" : ""}</span>
                                </button>
                                <div className="flex items-center gap-1">
                                  <button onClick={() => { setAddType("employee"); setFormParentId(tm.teamID); }} className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" title="Add employee">
                                    <Plus size={11} />
                                  </button>
                                  <button onClick={() => setDeleteTarget({ type: "team", id: tm.teamID, name: tm.name })} className="p-1.5 rounded text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors">
                                    <Trash2 size={11} />
                                  </button>
                                </div>
                              </div>

                              {/* Employees */}
                              {teamExpanded && tmEmps.length > 0 && (
                                <div className="px-14 pb-2 space-y-0.5">
                                  {tmEmps.map(emp => (
                                    <div key={emp.employeeID} className="flex items-center group">
                                      <div className="flex-1">
                                        <EmployeeBadge emp={emp} />
                                      </div>
                                      <button
                                        onClick={() => setDeleteTarget({ type: "employee", id: emp.employeeID, name: `${emp.firstName} ${emp.lastName}` })}
                                        className="p-1.5 rounded text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors opacity-0 group-hover:opacity-100"
                                      >
                                        <Trash2 size={11} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                  {compDepts.length === 0 && (
                    <p className="px-8 py-3 text-xs text-muted-foreground italic">No departments yet</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add dialog */}
      <Dialog open={!!addType} onOpenChange={(v) => !v && setAddType(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add {addType?.charAt(0).toUpperCase()}{addType?.slice(1)}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {addType === "employee" ? (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="First name" value={formFirstName} onChange={e => setFormFirstName(e.target.value)} data-testid="input-first-name" />
                  <Input placeholder="Last name" value={formLastName} onChange={e => setFormLastName(e.target.value)} data-testid="input-last-name" />
                </div>
                <Input placeholder="Email" type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} data-testid="input-email" />
                <Select value={formParentId?.toString() ?? ""} onValueChange={v => setFormParentId(parseInt(v))}>
                  <SelectTrigger data-testid="select-employee-team"><SelectValue placeholder="Select team (optional)" /></SelectTrigger>
                  <SelectContent>
                    {teams.map(t => <SelectItem key={t.teamID} value={t.teamID.toString()}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </>
            ) : (
              <>
                <Input
                  placeholder={`${addType?.charAt(0).toUpperCase()}${addType?.slice(1)} name`}
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  data-testid="input-org-name"
                />
                {addType === "department" && !formParentId && (
                  <Select value={formParentId?.toString() ?? ""} onValueChange={v => setFormParentId(parseInt(v))}>
                    <SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger>
                    <SelectContent>
                      {companies.map(c => <SelectItem key={c.companyID} value={c.companyID.toString()}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
                {addType === "team" && !formParentId && (
                  <Select value={formParentId?.toString() ?? ""} onValueChange={v => setFormParentId(parseInt(v))}>
                    <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                    <SelectContent>
                      {departments.map(d => <SelectItem key={d.depID} value={d.depID.toString()}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddType(null)}>Cancel</Button>
            <Button onClick={() => addMutation.mutate()} disabled={addMutation.isPending} data-testid="btn-confirm-add">
              {addMutation.isPending ? "Adding…" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.type}?</AlertDialogTitle>
            <AlertDialogDescription>"{deleteTarget?.name}" will be permanently deleted.</AlertDialogDescription>
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

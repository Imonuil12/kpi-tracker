import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { fetchCompanies, fetchDepartments, fetchTeams, fetchEmployees, createGoal, updateGoal } from "@/lib/api";
import { insertGoalSchema } from "@shared/schema";
import type { Goal } from "@/lib/api";

const formSchema = insertGoalSchema.extend({
  targetValue: z.coerce.number().min(0),
  currentValue: z.coerce.number().min(0),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onClose: () => void;
  editGoal?: Goal | null;
}

const LEVELS = ["company", "department", "team", "employee"] as const;
const STATUSES = ["Not Started", "In Progress", "On Track", "Behind", "Achieved"];

export default function GoalFormDialog({ open, onClose, editGoal }: Props) {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: companies = [] } = useQuery({ queryKey: ["/api/companies"], queryFn: fetchCompanies, enabled: open });
  const { data: departments = [] } = useQuery({ queryKey: ["/api/departments"], queryFn: fetchDepartments, enabled: open });
  const { data: teams = [] } = useQuery({ queryKey: ["/api/teams"], queryFn: fetchTeams, enabled: open });
  const { data: employees = [] } = useQuery({ queryKey: ["/api/employees"], queryFn: fetchEmployees, enabled: open });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      level: "team",
      status: "Not Started",
      unitOfMeasure: "Percent",
      targetValue: 100,
      currentValue: 0,
      startDate: "",
      endDate: "",
      strategy: "",
      smartGoal: "",
      budget: undefined,
      companyID: undefined,
      depID: undefined,
      teamID: undefined,
      employeeID: undefined,
    },
  });

  const level = form.watch("level");

  useEffect(() => {
    if (editGoal) {
      form.reset({
        name: editGoal.name,
        level: editGoal.level as any,
        status: editGoal.status ?? "Not Started",
        unitOfMeasure: editGoal.unitOfMeasure ?? "Percent",
        targetValue: editGoal.targetValue ?? 100,
        currentValue: editGoal.currentValue ?? 0,
        startDate: editGoal.startDate ?? "",
        endDate: editGoal.endDate ?? "",
        strategy: editGoal.strategy ?? "",
        smartGoal: editGoal.smartGoal ?? "",
        budget: editGoal.budget ?? undefined,
        companyID: editGoal.companyID ?? undefined,
        depID: editGoal.depID ?? undefined,
        teamID: editGoal.teamID ?? undefined,
        employeeID: editGoal.employeeID ?? undefined,
      });
    } else {
      form.reset({
        name: "", level: "team", status: "Not Started", unitOfMeasure: "Percent",
        targetValue: 100, currentValue: 0, startDate: "", endDate: "",
        strategy: "", smartGoal: "", budget: undefined,
        companyID: undefined, depID: undefined, teamID: undefined, employeeID: undefined,
      });
    }
  }, [editGoal, open]);

  const mutation = useMutation({
    mutationFn: (data: FormValues) => editGoal
      ? updateGoal(editGoal.goalID, data).then(r => r.json())
      : createGoal(data).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({ title: editGoal ? "Goal updated" : "Goal created" });
      onClose();
    },
    onError: () => toast({ title: "Error saving goal", variant: "destructive" }),
  });

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editGoal ? "Edit Goal" : "Create Goal"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
            {/* Name */}
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Goal Name</FormLabel>
                <FormControl><Input {...field} placeholder="e.g. Increase Q3 Revenue" data-testid="input-goal-name" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Level + Status */}
            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="level" render={({ field }) => (
                <FormItem>
                  <FormLabel>Level</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl><SelectTrigger data-testid="select-level"><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {LEVELS.map(l => <SelectItem key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
              <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select value={field.value ?? "Not Started"} onValueChange={field.onChange}>
                    <FormControl><SelectTrigger data-testid="select-status"><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
            </div>

            {/* Owner FK */}
            {level === "company" && (
              <FormField control={form.control} name="companyID" render={({ field }) => (
                <FormItem>
                  <FormLabel>Company</FormLabel>
                  <Select value={field.value?.toString() ?? ""} onValueChange={v => field.onChange(parseInt(v))}>
                    <FormControl><SelectTrigger data-testid="select-company"><SelectValue placeholder="Select company" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {companies.map(c => <SelectItem key={c.companyID} value={c.companyID.toString()}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
            )}
            {level === "department" && (
              <FormField control={form.control} name="depID" render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <Select value={field.value?.toString() ?? ""} onValueChange={v => field.onChange(parseInt(v))}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {departments.map(d => <SelectItem key={d.depID} value={d.depID.toString()}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
            )}
            {level === "team" && (
              <FormField control={form.control} name="teamID" render={({ field }) => (
                <FormItem>
                  <FormLabel>Team</FormLabel>
                  <Select value={field.value?.toString() ?? ""} onValueChange={v => field.onChange(parseInt(v))}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select team" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {teams.map(t => <SelectItem key={t.teamID} value={t.teamID.toString()}>{t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
            )}
            {level === "employee" && (
              <FormField control={form.control} name="employeeID" render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee</FormLabel>
                  <Select value={field.value?.toString() ?? ""} onValueChange={v => field.onChange(parseInt(v))}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {employees.map(e => <SelectItem key={e.employeeID} value={e.employeeID.toString()}>{e.firstName} {e.lastName}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
            )}

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <FormField control={form.control} name="targetValue" render={({ field }) => (
                <FormItem>
                  <FormLabel>Target</FormLabel>
                  <FormControl><Input type="number" {...field} data-testid="input-target" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="currentValue" render={({ field }) => (
                <FormItem>
                  <FormLabel>Current</FormLabel>
                  <FormControl><Input type="number" {...field} data-testid="input-current" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="unitOfMeasure" render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit</FormLabel>
                  <FormControl><Input {...field} placeholder="e.g. USD" data-testid="input-unit" /></FormControl>
                </FormItem>
              )} />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="startDate" render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl><Input type="date" {...field} value={field.value ?? ""} /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="endDate" render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>
                  <FormControl><Input type="date" {...field} value={field.value ?? ""} /></FormControl>
                </FormItem>
              )} />
            </div>

            {/* Level-specific extras */}
            {level === "company" && (
              <FormField control={form.control} name="strategy" render={({ field }) => (
                <FormItem>
                  <FormLabel>Strategy</FormLabel>
                  <FormControl><Textarea {...field} value={field.value ?? ""} placeholder="Describe the strategy..." rows={2} /></FormControl>
                </FormItem>
              )} />
            )}
            {level === "department" && (
              <FormField control={form.control} name="budget" render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget (USD)</FormLabel>
                  <FormControl><Input type="number" {...field} value={field.value ?? ""} onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} /></FormControl>
                </FormItem>
              )} />
            )}
            {level === "employee" && (
              <FormField control={form.control} name="smartGoal" render={({ field }) => (
                <FormItem>
                  <FormLabel>SMART Goal Description</FormLabel>
                  <FormControl><Textarea {...field} value={field.value ?? ""} placeholder="Specific, Measurable, Achievable..." rows={2} /></FormControl>
                </FormItem>
              )} />
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} data-testid="btn-cancel">Cancel</Button>
              <Button type="submit" disabled={mutation.isPending} data-testid="btn-submit-goal">
                {mutation.isPending ? "Saving…" : editGoal ? "Update Goal" : "Create Goal"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

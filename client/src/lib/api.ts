import { apiRequest } from "@/lib/queryClient";
import type { Goal, Company, Department, Team, Employee, InsertGoal, InsertCompany, InsertDepartment, InsertTeam, InsertEmployee } from "@shared/schema";

export type { Goal, Company, Department, Team, Employee };

// Goals
export const fetchGoals = (): Promise<Goal[]> => fetch("/api/goals").then(r => r.json());
export const fetchGoal = (id: number): Promise<Goal> => fetch(`/api/goals/${id}`).then(r => r.json());
export const createGoal = (data: InsertGoal) => apiRequest("POST", "/api/goals", data);
export const updateGoal = (id: number, data: Partial<InsertGoal>) => apiRequest("PATCH", `/api/goals/${id}`, data);
export const deleteGoal = (id: number) => apiRequest("DELETE", `/api/goals/${id}`);

// Companies
export const fetchCompanies = (): Promise<Company[]> => fetch("/api/companies").then(r => r.json());
export const createCompany = (data: InsertCompany) => apiRequest("POST", "/api/companies", data);
export const updateCompany = (id: number, data: Partial<InsertCompany>) => apiRequest("PATCH", `/api/companies/${id}`, data);
export const deleteCompany = (id: number) => apiRequest("DELETE", `/api/companies/${id}`);

// Departments
export const fetchDepartments = (): Promise<Department[]> => fetch("/api/departments").then(r => r.json());
export const createDepartment = (data: InsertDepartment) => apiRequest("POST", "/api/departments", data);
export const updateDepartment = (id: number, data: Partial<InsertDepartment>) => apiRequest("PATCH", `/api/departments/${id}`, data);
export const deleteDepartment = (id: number) => apiRequest("DELETE", `/api/departments/${id}`);

// Teams
export const fetchTeams = (): Promise<Team[]> => fetch("/api/teams").then(r => r.json());
export const createTeam = (data: InsertTeam) => apiRequest("POST", "/api/teams", data);
export const updateTeam = (id: number, data: Partial<InsertTeam>) => apiRequest("PATCH", `/api/teams/${id}`, data);
export const deleteTeam = (id: number) => apiRequest("DELETE", `/api/teams/${id}`);

// Employees
export const fetchEmployees = (): Promise<Employee[]> => fetch("/api/employees").then(r => r.json());
export const createEmployee = (data: InsertEmployee) => apiRequest("POST", "/api/employees", data);
export const updateEmployee = (id: number, data: Partial<InsertEmployee>) => apiRequest("PATCH", `/api/employees/${id}`, data);
export const deleteEmployee = (id: number) => apiRequest("DELETE", `/api/employees/${id}`);

// Helpers
export function getProgressPercent(goal: Goal): number {
  if (!goal.targetValue || goal.targetValue === 0) return 0;
  const raw = ((goal.currentValue ?? 0) / goal.targetValue) * 100;
  return Math.min(Math.round(raw), 100);
}

export function getStatusColor(status: string | null | undefined): string {
  switch (status) {
    case "Achieved": return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800";
    case "On Track": return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800";
    case "In Progress": return "text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800";
    case "Behind": return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800";
    case "Not Started": return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700";
    default: return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700";
  }
}

export function getProgressBarColor(status: string | null | undefined): string {
  switch (status) {
    case "Achieved": return "bg-green-500";
    case "On Track": return "bg-blue-500";
    case "In Progress": return "bg-yellow-500";
    case "Behind": return "bg-red-500";
    default: return "bg-gray-400";
  }
}

export function getLevelColor(level: string): string {
  switch (level) {
    case "company": return "text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800";
    case "department": return "text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800";
    case "team": return "text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 border-teal-200 dark:border-teal-800";
    case "employee": return "text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800";
    default: return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700";
  }
}

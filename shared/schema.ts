import { pgTable, text, integer, serial, varchar, date, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const goalLevelSchema = z.enum(["company", "department", "team", "employee"]);
export type GoalLevel = z.infer<typeof goalLevelSchema>;

export const company = pgTable("company", {
  companyID: serial("companyID").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  mainAddress: varchar("mainAddress", { length: 500 }),
});
export const insertCompanySchema = createInsertSchema(company).omit({ companyID: true });
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = typeof company.$inferSelect;

export const department = pgTable("department", {
  depID: serial("depID").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }),
  companyID: integer("companyID").notNull().references(() => company.companyID, { onDelete: "cascade" }),
});
export const insertDepartmentSchema = createInsertSchema(department).omit({ depID: true });
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type Department = typeof department.$inferSelect;

export const team = pgTable("team", {
  teamID: serial("teamID").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  depID: integer("depID").notNull().references(() => department.depID, { onDelete: "cascade" }),
});
export const insertTeamSchema = createInsertSchema(team).omit({ teamID: true });
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type Team = typeof team.$inferSelect;

export const employee = pgTable("employee", {
  employeeID: serial("employeeID").primaryKey(),
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  teamID: integer("teamID").references(() => team.teamID, { onDelete: "set null" }),
});
export const insertEmployeeSchema = createInsertSchema(employee).omit({ employeeID: true });
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Employee = typeof employee.$inferSelect;

export const goal = pgTable("goal", {
  goalID: serial("goalID").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  unitOfMeasure: varchar("unitOfMeasure", { length: 50 }),
  status: varchar("status", { length: 50 }),
  targetValue: numeric("targetValue", { precision: 15, scale: 2 }),
  currentValue: numeric("currentValue", { precision: 15, scale: 2 }),
  startDate: date("startDate", { mode: "string" }),
  endDate: date("endDate", { mode: "string" }),
});

export const companyGoal = pgTable("companygoal", {
  goalID: integer("goalID").primaryKey().references(() => goal.goalID, { onDelete: "cascade" }),
  strategy: text("strategy"),
  companyID: integer("companyID").notNull().references(() => company.companyID, { onDelete: "cascade" }),
});

export const departmentGoal = pgTable("departmentgoal", {
  goalID: integer("goalID").primaryKey().references(() => goal.goalID, { onDelete: "cascade" }),
  budget: numeric("budget", { precision: 15, scale: 2 }),
  depID: integer("depID").notNull().references(() => department.depID, { onDelete: "cascade" }),
});

export const teamGoal = pgTable("teamgoal", {
  goalID: integer("goalID").primaryKey().references(() => goal.goalID, { onDelete: "cascade" }),
  teamID: integer("teamID").notNull().references(() => team.teamID, { onDelete: "cascade" }),
});

export const employeeGoal = pgTable("employeegoal", {
  goalID: integer("goalID").primaryKey().references(() => goal.goalID, { onDelete: "cascade" }),
  smartGoal: text("smartGoal"),
  employeeID: integer("employeeID").notNull().references(() => employee.employeeID, { onDelete: "cascade" }),
});

export const insertGoalObjectSchema = z.object({
  name: z.string().min(1),
  unitOfMeasure: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  targetValue: z.number().optional().nullable(),
  currentValue: z.number().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  level: goalLevelSchema,
  companyID: z.number().int().optional(),
  depID: z.number().int().optional(),
  teamID: z.number().int().optional(),
  employeeID: z.number().int().optional(),
  strategy: z.string().optional().nullable(),
  budget: z.number().optional().nullable(),
  smartGoal: z.string().optional().nullable(),
});

export const insertGoalSchema = insertGoalObjectSchema.superRefine((value, ctx) => {
  if (value.level === "company" && !value.companyID) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["companyID"], message: "Company is required for company goals" });
  }
  if (value.level === "department" && !value.depID) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["depID"], message: "Department is required for department goals" });
  }
  if (value.level === "team" && !value.teamID) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["teamID"], message: "Team is required for team goals" });
  }
  if (value.level === "employee" && !value.employeeID) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["employeeID"], message: "Employee is required for employee goals" });
  }
});

export type InsertGoal = z.infer<typeof insertGoalSchema>;

export interface Goal {
  goalID: number;
  name: string;
  unitOfMeasure: string | null;
  status: string | null;
  targetValue: number | null;
  currentValue: number | null;
  startDate: string | null;
  endDate: string | null;
  level: GoalLevel;
  companyID: number | null;
  depID: number | null;
  teamID: number | null;
  employeeID: number | null;
  strategy: string | null;
  budget: number | null;
  smartGoal: string | null;
}

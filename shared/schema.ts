import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ==========================================
// Company
// ==========================================
export const company = sqliteTable("company", {
  companyID: integer("companyID").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  mainAddress: text("mainAddress"),
});
export const insertCompanySchema = createInsertSchema(company).omit({ companyID: true });
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = typeof company.$inferSelect;

// ==========================================
// Department
// ==========================================
export const department = sqliteTable("department", {
  depID: integer("depID").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  location: text("location"),
  companyID: integer("companyID").notNull(),
});
export const insertDepartmentSchema = createInsertSchema(department).omit({ depID: true });
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type Department = typeof department.$inferSelect;

// ==========================================
// Team
// ==========================================
export const team = sqliteTable("team", {
  teamID: integer("teamID").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  depID: integer("depID").notNull(),
});
export const insertTeamSchema = createInsertSchema(team).omit({ teamID: true });
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type Team = typeof team.$inferSelect;

// ==========================================
// Employee
// ==========================================
export const employee = sqliteTable("employee", {
  employeeID: integer("employeeID").primaryKey({ autoIncrement: true }),
  firstName: text("firstName").notNull(),
  lastName: text("lastName").notNull(),
  email: text("email").notNull().unique(),
  teamID: integer("teamID"),
});
export const insertEmployeeSchema = createInsertSchema(employee).omit({ employeeID: true });
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Employee = typeof employee.$inferSelect;

// ==========================================
// Goal (Superclass)
// ==========================================
export const goal = sqliteTable("goal", {
  goalID: integer("goalID").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  unitOfMeasure: text("unitOfMeasure"),
  status: text("status"),
  targetValue: real("targetValue"),
  currentValue: real("currentValue"),
  startDate: text("startDate"),
  endDate: text("endDate"),
  // ISA level stored directly for prototype simplicity
  level: text("level").notNull(), // 'company' | 'department' | 'team' | 'employee'
  // FK to the owning entity
  companyID: integer("companyID"),
  depID: integer("depID"),
  teamID: integer("teamID"),
  employeeID: integer("employeeID"),
  // Extra fields from subclass tables
  strategy: text("strategy"),
  budget: real("budget"),
  smartGoal: text("smartGoal"),
});
export const insertGoalSchema = createInsertSchema(goal).omit({ goalID: true });
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goal.$inferSelect;

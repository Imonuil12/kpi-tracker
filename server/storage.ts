import { db } from "./db";
import {
  company, department, team, employee, goal,
  type Company, type InsertCompany,
  type Department, type InsertDepartment,
  type Team, type InsertTeam,
  type Employee, type InsertEmployee,
  type Goal, type InsertGoal,
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Company
  getCompanies(): Company[];
  getCompany(id: number): Company | undefined;
  createCompany(data: InsertCompany): Company;
  updateCompany(id: number, data: Partial<InsertCompany>): Company | undefined;
  deleteCompany(id: number): void;

  // Department
  getDepartments(): Department[];
  getDepartmentsByCompany(companyID: number): Department[];
  getDepartment(id: number): Department | undefined;
  createDepartment(data: InsertDepartment): Department;
  updateDepartment(id: number, data: Partial<InsertDepartment>): Department | undefined;
  deleteDepartment(id: number): void;

  // Team
  getTeams(): Team[];
  getTeamsByDepartment(depID: number): Team[];
  getTeam(id: number): Team | undefined;
  createTeam(data: InsertTeam): Team;
  updateTeam(id: number, data: Partial<InsertTeam>): Team | undefined;
  deleteTeam(id: number): void;

  // Employee
  getEmployees(): Employee[];
  getEmployeesByTeam(teamID: number): Employee[];
  getEmployee(id: number): Employee | undefined;
  createEmployee(data: InsertEmployee): Employee;
  updateEmployee(id: number, data: Partial<InsertEmployee>): Employee | undefined;
  deleteEmployee(id: number): void;

  // Goal
  getGoals(): Goal[];
  getGoal(id: number): Goal | undefined;
  createGoal(data: InsertGoal): Goal;
  updateGoal(id: number, data: Partial<InsertGoal>): Goal | undefined;
  deleteGoal(id: number): void;
}

export class DatabaseStorage implements IStorage {
  // Company
  getCompanies(): Company[] { return db.select().from(company).all(); }
  getCompany(id: number): Company | undefined { return db.select().from(company).where(eq(company.companyID, id)).get(); }
  createCompany(data: InsertCompany): Company { return db.insert(company).values(data).returning().get(); }
  updateCompany(id: number, data: Partial<InsertCompany>): Company | undefined { return db.update(company).set(data).where(eq(company.companyID, id)).returning().get(); }
  deleteCompany(id: number): void { db.delete(company).where(eq(company.companyID, id)).run(); }

  // Department
  getDepartments(): Department[] { return db.select().from(department).all(); }
  getDepartmentsByCompany(companyID: number): Department[] { return db.select().from(department).where(eq(department.companyID, companyID)).all(); }
  getDepartment(id: number): Department | undefined { return db.select().from(department).where(eq(department.depID, id)).get(); }
  createDepartment(data: InsertDepartment): Department { return db.insert(department).values(data).returning().get(); }
  updateDepartment(id: number, data: Partial<InsertDepartment>): Department | undefined { return db.update(department).set(data).where(eq(department.depID, id)).returning().get(); }
  deleteDepartment(id: number): void { db.delete(department).where(eq(department.depID, id)).run(); }

  // Team
  getTeams(): Team[] { return db.select().from(team).all(); }
  getTeamsByDepartment(depID: number): Team[] { return db.select().from(team).where(eq(team.depID, depID)).all(); }
  getTeam(id: number): Team | undefined { return db.select().from(team).where(eq(team.teamID, id)).get(); }
  createTeam(data: InsertTeam): Team { return db.insert(team).values(data).returning().get(); }
  updateTeam(id: number, data: Partial<InsertTeam>): Team | undefined { return db.update(team).set(data).where(eq(team.teamID, id)).returning().get(); }
  deleteTeam(id: number): void { db.delete(team).where(eq(team.teamID, id)).run(); }

  // Employee
  getEmployees(): Employee[] { return db.select().from(employee).all(); }
  getEmployeesByTeam(teamID: number): Employee[] { return db.select().from(employee).where(eq(employee.teamID, teamID)).all(); }
  getEmployee(id: number): Employee | undefined { return db.select().from(employee).where(eq(employee.employeeID, id)).get(); }
  createEmployee(data: InsertEmployee): Employee { return db.insert(employee).values(data).returning().get(); }
  updateEmployee(id: number, data: Partial<InsertEmployee>): Employee | undefined { return db.update(employee).set(data).where(eq(employee.employeeID, id)).returning().get(); }
  deleteEmployee(id: number): void { db.delete(employee).where(eq(employee.employeeID, id)).run(); }

  // Goal
  getGoals(): Goal[] { return db.select().from(goal).all(); }
  getGoal(id: number): Goal | undefined { return db.select().from(goal).where(eq(goal.goalID, id)).get(); }
  createGoal(data: InsertGoal): Goal { return db.insert(goal).values(data).returning().get(); }
  updateGoal(id: number, data: Partial<InsertGoal>): Goal | undefined { return db.update(goal).set(data).where(eq(goal.goalID, id)).returning().get(); }
  deleteGoal(id: number): void { db.delete(goal).where(eq(goal.goalID, id)).run(); }
}

export const storage = new DatabaseStorage();

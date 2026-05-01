import { eq } from "drizzle-orm";
import { db } from "./db";
import {
  company,
  companyGoal,
  department,
  departmentGoal,
  employee,
  employeeGoal,
  goal,
  team,
  teamGoal,
  type Company,
  type Department,
  type Employee,
  type Goal,
  type GoalLevel,
  type InsertCompany,
  type InsertDepartment,
  type InsertEmployee,
  type InsertGoal,
  type InsertTeam,
  type Team,
} from "@shared/schema";

type GoalBaseRow = typeof goal.$inferSelect;
type GoalSubtypeWriter = Pick<typeof db, "insert" | "delete">;

function parseNumeric(value: string | number | null): number | null {
  if (value == null) return null;
  return typeof value === "number" ? value : Number(value);
}

function normalizeGoal(
  base: GoalBaseRow,
  level: GoalLevel,
  extra: {
    companyID?: number | null;
    depID?: number | null;
    teamID?: number | null;
    employeeID?: number | null;
    strategy?: string | null;
    budget?: string | number | null;
    smartGoal?: string | null;
  },
): Goal {
  return {
    goalID: base.goalID,
    name: base.name,
    unitOfMeasure: base.unitOfMeasure ?? null,
    status: base.status ?? null,
    targetValue: parseNumeric(base.targetValue),
    currentValue: parseNumeric(base.currentValue),
    startDate: base.startDate ?? null,
    endDate: base.endDate ?? null,
    level,
    companyID: extra.companyID ?? null,
    depID: extra.depID ?? null,
    teamID: extra.teamID ?? null,
    employeeID: extra.employeeID ?? null,
    strategy: extra.strategy ?? null,
    budget: parseNumeric(extra.budget ?? null),
    smartGoal: extra.smartGoal ?? null,
  };
}

function sortGoals(goals: Goal[]): Goal[] {
  return goals.sort((a, b) => a.goalID - b.goalID);
}

function toNumericValue(value: number | null | undefined): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  return value.toFixed(2);
}

function toGoalInsertBase(data: InsertGoal) {
  return {
    name: data.name,
    unitOfMeasure: data.unitOfMeasure ?? null,
    status: data.status ?? null,
    targetValue: toNumericValue(data.targetValue),
    currentValue: toNumericValue(data.currentValue),
    startDate: data.startDate || null,
    endDate: data.endDate || null,
  };
}

function toGoalUpdateBase(data: Partial<InsertGoal>) {
  return {
    ...(data.name !== undefined ? { name: data.name } : {}),
    ...(data.unitOfMeasure !== undefined ? { unitOfMeasure: data.unitOfMeasure ?? null } : {}),
    ...(data.status !== undefined ? { status: data.status ?? null } : {}),
    ...(data.targetValue !== undefined ? { targetValue: toNumericValue(data.targetValue) ?? null } : {}),
    ...(data.currentValue !== undefined ? { currentValue: toNumericValue(data.currentValue) ?? null } : {}),
    ...(data.startDate !== undefined ? { startDate: data.startDate || null } : {}),
    ...(data.endDate !== undefined ? { endDate: data.endDate || null } : {}),
  };
}

async function insertGoalSubtype(tx: GoalSubtypeWriter, data: InsertGoal & { goalID: number }) {
  switch (data.level) {
    case "company":
      await tx.insert(companyGoal).values({
        goalID: data.goalID,
        strategy: data.strategy ?? null,
        companyID: data.companyID!,
      });
      return;
    case "department":
      await tx.insert(departmentGoal).values({
        goalID: data.goalID,
        budget: toNumericValue(data.budget) ?? null,
        depID: data.depID!,
      });
      return;
    case "team":
      await tx.insert(teamGoal).values({
        goalID: data.goalID,
        teamID: data.teamID!,
      });
      return;
    case "employee":
      await tx.insert(employeeGoal).values({
        goalID: data.goalID,
        smartGoal: data.smartGoal ?? null,
        employeeID: data.employeeID!,
      });
      return;
  }
}

async function deleteGoalSubtype(tx: GoalSubtypeWriter, level: GoalLevel, goalID: number) {
  switch (level) {
    case "company":
      await tx.delete(companyGoal).where(eq(companyGoal.goalID, goalID));
      return;
    case "department":
      await tx.delete(departmentGoal).where(eq(departmentGoal.goalID, goalID));
      return;
    case "team":
      await tx.delete(teamGoal).where(eq(teamGoal.goalID, goalID));
      return;
    case "employee":
      await tx.delete(employeeGoal).where(eq(employeeGoal.goalID, goalID));
      return;
  }
}

export interface IStorage {
  getCompanies(): Promise<Company[]>;
  getCompany(id: number): Promise<Company | undefined>;
  createCompany(data: InsertCompany): Promise<Company>;
  updateCompany(id: number, data: Partial<InsertCompany>): Promise<Company | undefined>;
  deleteCompany(id: number): Promise<void>;

  getDepartments(): Promise<Department[]>;
  getDepartmentsByCompany(companyID: number): Promise<Department[]>;
  getDepartment(id: number): Promise<Department | undefined>;
  createDepartment(data: InsertDepartment): Promise<Department>;
  updateDepartment(id: number, data: Partial<InsertDepartment>): Promise<Department | undefined>;
  deleteDepartment(id: number): Promise<void>;

  getTeams(): Promise<Team[]>;
  getTeamsByDepartment(depID: number): Promise<Team[]>;
  getTeam(id: number): Promise<Team | undefined>;
  createTeam(data: InsertTeam): Promise<Team>;
  updateTeam(id: number, data: Partial<InsertTeam>): Promise<Team | undefined>;
  deleteTeam(id: number): Promise<void>;

  getEmployees(): Promise<Employee[]>;
  getEmployeesByTeam(teamID: number): Promise<Employee[]>;
  getEmployee(id: number): Promise<Employee | undefined>;
  createEmployee(data: InsertEmployee): Promise<Employee>;
  updateEmployee(id: number, data: Partial<InsertEmployee>): Promise<Employee | undefined>;
  deleteEmployee(id: number): Promise<void>;

  getGoals(): Promise<Goal[]>;
  getGoal(id: number): Promise<Goal | undefined>;
  createGoal(data: InsertGoal): Promise<Goal>;
  updateGoal(id: number, data: Partial<InsertGoal>): Promise<Goal | undefined>;
  deleteGoal(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getCompanies(): Promise<Company[]> {
    return db.select().from(company);
  }

  async getCompany(id: number): Promise<Company | undefined> {
    const [result] = await db.select().from(company).where(eq(company.companyID, id));
    return result;
  }

  async createCompany(data: InsertCompany): Promise<Company> {
    const [result] = await db.insert(company).values(data).returning();
    return result;
  }

  async updateCompany(id: number, data: Partial<InsertCompany>): Promise<Company | undefined> {
    const [result] = await db.update(company).set(data).where(eq(company.companyID, id)).returning();
    return result;
  }

  async deleteCompany(id: number): Promise<void> {
    await db.delete(company).where(eq(company.companyID, id));
  }

  async getDepartments(): Promise<Department[]> {
    return db.select().from(department);
  }

  async getDepartmentsByCompany(companyID: number): Promise<Department[]> {
    return db.select().from(department).where(eq(department.companyID, companyID));
  }

  async getDepartment(id: number): Promise<Department | undefined> {
    const [result] = await db.select().from(department).where(eq(department.depID, id));
    return result;
  }

  async createDepartment(data: InsertDepartment): Promise<Department> {
    const [result] = await db.insert(department).values(data).returning();
    return result;
  }

  async updateDepartment(id: number, data: Partial<InsertDepartment>): Promise<Department | undefined> {
    const [result] = await db.update(department).set(data).where(eq(department.depID, id)).returning();
    return result;
  }

  async deleteDepartment(id: number): Promise<void> {
    await db.delete(department).where(eq(department.depID, id));
  }

  async getTeams(): Promise<Team[]> {
    return db.select().from(team);
  }

  async getTeamsByDepartment(depID: number): Promise<Team[]> {
    return db.select().from(team).where(eq(team.depID, depID));
  }

  async getTeam(id: number): Promise<Team | undefined> {
    const [result] = await db.select().from(team).where(eq(team.teamID, id));
    return result;
  }

  async createTeam(data: InsertTeam): Promise<Team> {
    const [result] = await db.insert(team).values(data).returning();
    return result;
  }

  async updateTeam(id: number, data: Partial<InsertTeam>): Promise<Team | undefined> {
    const [result] = await db.update(team).set(data).where(eq(team.teamID, id)).returning();
    return result;
  }

  async deleteTeam(id: number): Promise<void> {
    await db.delete(team).where(eq(team.teamID, id));
  }

  async getEmployees(): Promise<Employee[]> {
    return db.select().from(employee);
  }

  async getEmployeesByTeam(teamID: number): Promise<Employee[]> {
    return db.select().from(employee).where(eq(employee.teamID, teamID));
  }

  async getEmployee(id: number): Promise<Employee | undefined> {
    const [result] = await db.select().from(employee).where(eq(employee.employeeID, id));
    return result;
  }

  async createEmployee(data: InsertEmployee): Promise<Employee> {
    const [result] = await db.insert(employee).values(data).returning();
    return result;
  }

  async updateEmployee(id: number, data: Partial<InsertEmployee>): Promise<Employee | undefined> {
    const [result] = await db.update(employee).set(data).where(eq(employee.employeeID, id)).returning();
    return result;
  }

  async deleteEmployee(id: number): Promise<void> {
    await db.delete(employee).where(eq(employee.employeeID, id));
  }

  async getGoals(): Promise<Goal[]> {
    const [companyGoals, departmentGoals, teamGoals, employeeGoals] = await Promise.all([
      db.select({
        base: goal,
        companyID: companyGoal.companyID,
        strategy: companyGoal.strategy,
      }).from(goal).innerJoin(companyGoal, eq(goal.goalID, companyGoal.goalID)),
      db.select({
        base: goal,
        depID: departmentGoal.depID,
        budget: departmentGoal.budget,
      }).from(goal).innerJoin(departmentGoal, eq(goal.goalID, departmentGoal.goalID)),
      db.select({
        base: goal,
        teamID: teamGoal.teamID,
      }).from(goal).innerJoin(teamGoal, eq(goal.goalID, teamGoal.goalID)),
      db.select({
        base: goal,
        employeeID: employeeGoal.employeeID,
        smartGoal: employeeGoal.smartGoal,
      }).from(goal).innerJoin(employeeGoal, eq(goal.goalID, employeeGoal.goalID)),
    ]);

    return sortGoals([
      ...companyGoals.map(({ base, companyID, strategy }) => normalizeGoal(base, "company", { companyID, strategy })),
      ...departmentGoals.map(({ base, depID, budget }) => normalizeGoal(base, "department", { depID, budget })),
      ...teamGoals.map(({ base, teamID }) => normalizeGoal(base, "team", { teamID })),
      ...employeeGoals.map(({ base, employeeID, smartGoal }) => normalizeGoal(base, "employee", { employeeID, smartGoal })),
    ]);
  }

  async getGoal(id: number): Promise<Goal | undefined> {
    const [companyResult] = await db.select({
      base: goal,
      companyID: companyGoal.companyID,
      strategy: companyGoal.strategy,
    }).from(goal).innerJoin(companyGoal, eq(goal.goalID, companyGoal.goalID)).where(eq(goal.goalID, id));
    if (companyResult) {
      return normalizeGoal(companyResult.base, "company", {
        companyID: companyResult.companyID,
        strategy: companyResult.strategy,
      });
    }

    const [departmentResult] = await db.select({
      base: goal,
      depID: departmentGoal.depID,
      budget: departmentGoal.budget,
    }).from(goal).innerJoin(departmentGoal, eq(goal.goalID, departmentGoal.goalID)).where(eq(goal.goalID, id));
    if (departmentResult) {
      return normalizeGoal(departmentResult.base, "department", {
        depID: departmentResult.depID,
        budget: departmentResult.budget,
      });
    }

    const [teamResult] = await db.select({
      base: goal,
      teamID: teamGoal.teamID,
    }).from(goal).innerJoin(teamGoal, eq(goal.goalID, teamGoal.goalID)).where(eq(goal.goalID, id));
    if (teamResult) {
      return normalizeGoal(teamResult.base, "team", {
        teamID: teamResult.teamID,
      });
    }

    const [employeeResult] = await db.select({
      base: goal,
      employeeID: employeeGoal.employeeID,
      smartGoal: employeeGoal.smartGoal,
    }).from(goal).innerJoin(employeeGoal, eq(goal.goalID, employeeGoal.goalID)).where(eq(goal.goalID, id));
    if (employeeResult) {
      return normalizeGoal(employeeResult.base, "employee", {
        employeeID: employeeResult.employeeID,
        smartGoal: employeeResult.smartGoal,
      });
    }

    return undefined;
  }

  async createGoal(data: InsertGoal): Promise<Goal> {
    return db.transaction(async (tx) => {
      const [createdGoal] = await tx.insert(goal).values(toGoalInsertBase(data)).returning();
      await insertGoalSubtype(tx, { ...data, goalID: createdGoal.goalID });
      return normalizeGoal(createdGoal, data.level, {
        companyID: data.level === "company" ? data.companyID ?? null : null,
        depID: data.level === "department" ? data.depID ?? null : null,
        teamID: data.level === "team" ? data.teamID ?? null : null,
        employeeID: data.level === "employee" ? data.employeeID ?? null : null,
        strategy: data.level === "company" ? data.strategy ?? null : null,
        budget: data.level === "department" ? data.budget ?? null : null,
        smartGoal: data.level === "employee" ? data.smartGoal ?? null : null,
      });
    });
  }

  async updateGoal(id: number, data: Partial<InsertGoal>): Promise<Goal | undefined> {
    const existing = await this.getGoal(id);
    if (!existing) return undefined;

    const merged: InsertGoal = {
      name: data.name ?? existing.name,
      unitOfMeasure: data.unitOfMeasure ?? existing.unitOfMeasure ?? undefined,
      status: data.status ?? existing.status ?? undefined,
      targetValue: data.targetValue ?? existing.targetValue ?? undefined,
      currentValue: data.currentValue ?? existing.currentValue ?? undefined,
      startDate: data.startDate ?? existing.startDate ?? undefined,
      endDate: data.endDate ?? existing.endDate ?? undefined,
      level: data.level ?? existing.level,
      companyID: data.companyID ?? existing.companyID ?? undefined,
      depID: data.depID ?? existing.depID ?? undefined,
      teamID: data.teamID ?? existing.teamID ?? undefined,
      employeeID: data.employeeID ?? existing.employeeID ?? undefined,
      strategy: data.strategy ?? existing.strategy ?? undefined,
      budget: data.budget ?? existing.budget ?? undefined,
      smartGoal: data.smartGoal ?? existing.smartGoal ?? undefined,
    };

    return db.transaction(async (tx) => {
      await tx.update(goal).set(toGoalUpdateBase(merged)).where(eq(goal.goalID, id));
      await deleteGoalSubtype(tx, existing.level, id);
      await insertGoalSubtype(tx, { ...merged, goalID: id });
      return {
        goalID: id,
        name: merged.name,
        unitOfMeasure: merged.unitOfMeasure ?? null,
        status: merged.status ?? null,
        targetValue: merged.targetValue ?? null,
        currentValue: merged.currentValue ?? null,
        startDate: merged.startDate || null,
        endDate: merged.endDate || null,
        level: merged.level,
        companyID: merged.level === "company" ? merged.companyID ?? null : null,
        depID: merged.level === "department" ? merged.depID ?? null : null,
        teamID: merged.level === "team" ? merged.teamID ?? null : null,
        employeeID: merged.level === "employee" ? merged.employeeID ?? null : null,
        strategy: merged.level === "company" ? merged.strategy ?? null : null,
        budget: merged.level === "department" ? merged.budget ?? null : null,
        smartGoal: merged.level === "employee" ? merged.smartGoal ?? null : null,
      };
    });
  }

  async deleteGoal(id: number): Promise<void> {
    await db.delete(goal).where(eq(goal.goalID, id));
  }
}

export const storage = new DatabaseStorage();

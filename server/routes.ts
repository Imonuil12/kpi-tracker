import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import {
  insertGoalSchema, insertCompanySchema, insertDepartmentSchema,
  insertTeamSchema, insertEmployeeSchema,
} from "@shared/schema";

async function seedDatabase() {
  const companies = await storage.getCompanies();
  if (companies.length > 0) return; // Already seeded

  // Companies
  const acme = await storage.createCompany({ name: "Acme Corp", mainAddress: "123 Acme Way, Metropolis" });
  const globex = await storage.createCompany({ name: "Globex", mainAddress: "456 Globex Road, Star City" });

  // Departments
  const eng = await storage.createDepartment({ name: "Engineering", location: "Floor 2", companyID: acme.companyID });
  const sales = await storage.createDepartment({ name: "Sales", location: "Floor 1", companyID: acme.companyID });
  const marketing = await storage.createDepartment({ name: "Marketing", location: "Remote", companyID: globex.companyID });

  // Teams
  const frontend = await storage.createTeam({ name: "Frontend Team", depID: eng.depID });
  const backend = await storage.createTeam({ name: "Backend Team", depID: eng.depID });
  const enterpriseSales = await storage.createTeam({ name: "Enterprise Sales", depID: sales.depID });
  const growth = await storage.createTeam({ name: "Growth Marketing", depID: marketing.depID });

  // Employees
  const alice = await storage.createEmployee({ firstName: "Alice", lastName: "Smith", email: "alice@acme.com", teamID: frontend.teamID });
  const bob = await storage.createEmployee({ firstName: "Bob", lastName: "Jones", email: "bob@acme.com", teamID: backend.teamID });
  const charlie = await storage.createEmployee({ firstName: "Charlie", lastName: "Brown", email: "charlie@acme.com", teamID: enterpriseSales.teamID });
  await storage.createEmployee({ firstName: "Diana", lastName: "Prince", email: "diana@globex.com", teamID: growth.teamID });
  await storage.createEmployee({ firstName: "Evan", lastName: "Lee", email: "evan@acme.com", teamID: backend.teamID });
  await storage.createEmployee({ firstName: "Fiona", lastName: "Ward", email: "fiona@acme.com", teamID: frontend.teamID });

  // Goals
  // Company goals
  await storage.createGoal({
    name: "Increase Q3 Revenue",
    unitOfMeasure: "USD",
    status: "In Progress",
    targetValue: 1000000,
    currentValue: 450000,
    startDate: "2026-07-01",
    endDate: "2026-09-30",
    level: "company",
    companyID: acme.companyID,
    strategy: "Aggressive Market Expansion",
  });
  await storage.createGoal({
    name: "Expand to APAC Market",
    unitOfMeasure: "Percent",
    status: "Not Started",
    targetValue: 100,
    currentValue: 0,
    startDate: "2026-06-01",
    endDate: "2026-12-31",
    level: "company",
    companyID: globex.companyID,
    strategy: "Partner with local distributors and hire regional team",
  });

  // Department goals
  await storage.createGoal({
    name: "Launch New Product API",
    unitOfMeasure: "Percent",
    status: "On Track",
    targetValue: 100,
    currentValue: 60,
    startDate: "2026-01-01",
    endDate: "2026-06-30",
    level: "department",
    depID: eng.depID,
    budget: 50000,
  });
  await storage.createGoal({
    name: "Close 50 Enterprise Accounts",
    unitOfMeasure: "Accounts",
    status: "Behind",
    targetValue: 50,
    currentValue: 12,
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    level: "department",
    depID: sales.depID,
    budget: 120000,
  });

  // Team goals
  await storage.createGoal({
    name: "Reduce Server Latency",
    unitOfMeasure: "Milliseconds",
    status: "Behind",
    targetValue: 50,
    currentValue: 120,
    startDate: "2026-02-01",
    endDate: "2026-05-01",
    level: "team",
    teamID: backend.teamID,
  });
  await storage.createGoal({
    name: "Close 10 Enterprise Deals",
    unitOfMeasure: "Deals",
    status: "In Progress",
    targetValue: 10,
    currentValue: 3,
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    level: "team",
    teamID: enterpriseSales.teamID,
  });
  await storage.createGoal({
    name: "Improve Lighthouse Score",
    unitOfMeasure: "Score",
    status: "Achieved",
    targetValue: 90,
    currentValue: 92,
    startDate: "2026-01-01",
    endDate: "2026-03-31",
    level: "team",
    teamID: frontend.teamID,
  });

  // Employee goals
  await storage.createGoal({
    name: "Complete Auth Migration",
    unitOfMeasure: "Features",
    status: "Not Started",
    targetValue: 5,
    currentValue: 0,
    startDate: "2026-04-01",
    endDate: "2026-04-30",
    level: "employee",
    employeeID: bob.employeeID,
    smartGoal: "Specific: Migrate all auth. Measurable: 5 components.",
  });
  await storage.createGoal({
    name: "Redesign UI Layout",
    unitOfMeasure: "Percent",
    status: "In Progress",
    targetValue: 100,
    currentValue: 10,
    startDate: "2026-03-01",
    endDate: "2026-05-31",
    level: "employee",
    employeeID: alice.employeeID,
    smartGoal: "Ensure new accessibility standards are met.",
  });
  await storage.createGoal({
    name: "Close 3 Deals This Quarter",
    unitOfMeasure: "Deals",
    status: "In Progress",
    targetValue: 3,
    currentValue: 1,
    startDate: "2026-04-01",
    endDate: "2026-06-30",
    level: "employee",
    employeeID: charlie.employeeID,
    smartGoal: "Focus on Fortune 500 prospects in manufacturing sector.",
  });
}

export async function registerRoutes(httpServer: Server, app: Express) {
  // Seed on startup
  try {
    await seedDatabase();
  } catch (e) {
    console.error("Seed error:", e);
  }

  // ====== Companies ======
  app.get("/api/companies", async (_req, res) => {
    res.json(await storage.getCompanies());
  });
  app.post("/api/companies", async (req, res) => {
    const parsed = insertCompanySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    res.json(await storage.createCompany(parsed.data));
  });
  app.patch("/api/companies/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const updated = await storage.updateCompany(id, req.body);
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  });
  app.delete("/api/companies/:id", async (req, res) => {
    await storage.deleteCompany(parseInt(req.params.id));
    res.json({ ok: true });
  });

  // ====== Departments ======
  app.get("/api/departments", async (_req, res) => {
    res.json(await storage.getDepartments());
  });
  app.post("/api/departments", async (req, res) => {
    const parsed = insertDepartmentSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    res.json(await storage.createDepartment(parsed.data));
  });
  app.patch("/api/departments/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const updated = await storage.updateDepartment(id, req.body);
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  });
  app.delete("/api/departments/:id", async (req, res) => {
    await storage.deleteDepartment(parseInt(req.params.id));
    res.json({ ok: true });
  });

  // ====== Teams ======
  app.get("/api/teams", async (_req, res) => {
    res.json(await storage.getTeams());
  });
  app.post("/api/teams", async (req, res) => {
    const parsed = insertTeamSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    res.json(await storage.createTeam(parsed.data));
  });
  app.patch("/api/teams/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const updated = await storage.updateTeam(id, req.body);
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  });
  app.delete("/api/teams/:id", async (req, res) => {
    await storage.deleteTeam(parseInt(req.params.id));
    res.json({ ok: true });
  });

  // ====== Employees ======
  app.get("/api/employees", async (_req, res) => {
    res.json(await storage.getEmployees());
  });
  app.post("/api/employees", async (req, res) => {
    const parsed = insertEmployeeSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    res.json(await storage.createEmployee(parsed.data));
  });
  app.patch("/api/employees/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const updated = await storage.updateEmployee(id, req.body);
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  });
  app.delete("/api/employees/:id", async (req, res) => {
    await storage.deleteEmployee(parseInt(req.params.id));
    res.json({ ok: true });
  });

  // ====== Goals ======
  app.get("/api/goals", async (_req, res) => {
    res.json(await storage.getGoals());
  });
  app.get("/api/goals/:id", async (req, res) => {
    const g = await storage.getGoal(parseInt(req.params.id));
    if (!g) return res.status(404).json({ error: "Not found" });
    res.json(g);
  });
  app.post("/api/goals", async (req, res) => {
    const parsed = insertGoalSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    res.json(await storage.createGoal(parsed.data));
  });
  app.patch("/api/goals/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const updated = await storage.updateGoal(id, req.body);
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  });
  app.delete("/api/goals/:id", async (req, res) => {
    await storage.deleteGoal(parseInt(req.params.id));
    res.json({ ok: true });
  });
}

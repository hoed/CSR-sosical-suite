import { pgTable, text, serial, integer, boolean, timestamp, json, real, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("contributor"), // admin, contributor, reviewer
  organizationId: integer("organization_id").references(() => organizations.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Organizations
export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  industry: text("industry"),
  logo: text("logo"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Projects for CSR/ESG initiatives
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  location: text("location"),
  category: text("category").notNull(), // Environmental, Social, Governance
  status: text("status").notNull().default("planned"), // planned, in_progress, completed, delayed, at_risk
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  completion: real("completion").default(0), // 0-100 percent
  impactScore: integer("impact_score"), // 0-100
  organizationId: integer("organization_id").references(() => organizations.id),
  createdById: integer("created_by_id").references(() => users.id),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Impact indicators/metrics
export const indicators = pgTable("indicators", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(), // environmental, social, governance
  unit: text("unit"), // e.g., tons, people, percent
  dataType: text("data_type").notNull(), // number, text, boolean, date
  projectId: integer("project_id").references(() => projects.id),
  createdById: integer("created_by_id").references(() => users.id),
  customizable: boolean("customizable").default(true),
});

// Values collected for indicators
export const indicatorValues = pgTable("indicator_values", {
  id: serial("id").primaryKey(),
  indicatorId: integer("indicator_id").references(() => indicators.id).notNull(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  value: text("value").notNull(), // Stored as text, converted based on data_type
  date: timestamp("date").defaultNow(),
  submittedById: integer("submitted_by_id").references(() => users.id),
});

// Form templates for data collection
export const formTemplates = pgTable("form_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  fields: json("fields").notNull(), // JSON structure defining form fields
  projectId: integer("project_id").references(() => projects.id),
  createdById: integer("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Form submissions
export const formSubmissions = pgTable("form_submissions", {
  id: serial("id").primaryKey(),
  formTemplateId: integer("form_template_id").references(() => formTemplates.id).notNull(),
  data: json("data").notNull(),
  submittedById: integer("submitted_by_id").references(() => users.id),
  submittedAt: timestamp("submitted_at").defaultNow(),
});

// ESG Scores
export const esgScores = pgTable("esg_scores", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").references(() => organizations.id).notNull(),
  environmentalScore: integer("environmental_score"), // 0-100
  socialScore: integer("social_score"), // 0-100
  governanceScore: integer("governance_score"), // 0-100
  period: text("period").notNull(), // e.g., "Q3 2023"
  calculatedAt: timestamp("calculated_at").defaultNow(),
});

// SDG Goals mapping
export const sdgGoals = pgTable("sdg_goals", {
  id: serial("id").primaryKey(),
  number: integer("number").notNull(), // 1-17
  name: text("name").notNull(),
  description: text("description"),
  color: text("color").notNull(),
});

// Project to SDG mappings
export const projectSdgMappings = pgTable("project_sdg_mappings", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  sdgId: integer("sdg_id").references(() => sdgGoals.id).notNull(),
  impactLevel: text("impact_level").notNull(), // weak, medium, strong
  notes: text("notes"),
  createdById: integer("created_by_id").references(() => users.id),
});

// Reports
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(), // project, impact, sdg
  format: text("format").notNull(), // pdf, excel
  parameters: json("parameters"), // Filter/configuration parameters
  createdById: integer("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // reminder, alert, info
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Audit logs
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(), // user, project, indicator, etc.
  entityId: integer("entity_id"),
  details: json("details"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  email: true,
  role: true,
  organizationId: true,
});

export const insertOrganizationSchema = createInsertSchema(organizations).pick({
  name: true,
  industry: true,
  logo: true,
});

export const insertProjectSchema = createInsertSchema(projects).pick({
  name: true,
  description: true,
  location: true,
  category: true,
  status: true,
  startDate: true,
  endDate: true,
  completion: true,
  impactScore: true,
  organizationId: true,
  createdById: true,
});

export const insertIndicatorSchema = createInsertSchema(indicators).pick({
  name: true,
  description: true,
  category: true,
  unit: true,
  dataType: true,
  projectId: true,
  createdById: true,
  customizable: true,
});

export const insertIndicatorValueSchema = createInsertSchema(indicatorValues).pick({
  indicatorId: true,
  projectId: true,
  value: true,
  date: true,
  submittedById: true,
});

export const insertFormTemplateSchema = createInsertSchema(formTemplates).pick({
  name: true,
  description: true,
  fields: true,
  projectId: true,
  createdById: true,
});

export const insertFormSubmissionSchema = createInsertSchema(formSubmissions).pick({
  formTemplateId: true,
  data: true,
  submittedById: true,
});

export const insertEsgScoreSchema = createInsertSchema(esgScores).pick({
  organizationId: true,
  environmentalScore: true,
  socialScore: true,
  governanceScore: true,
  period: true,
});

export const insertSdgGoalSchema = createInsertSchema(sdgGoals).pick({
  number: true,
  name: true,
  description: true,
  color: true,
});

export const insertProjectSdgMappingSchema = createInsertSchema(projectSdgMappings).pick({
  projectId: true,
  sdgId: true,
  impactLevel: true,
  notes: true,
  createdById: true,
});

export const insertReportSchema = createInsertSchema(reports).pick({
  name: true,
  description: true,
  type: true,
  format: true,
  parameters: true,
  createdById: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  userId: true,
  title: true,
  message: true,
  type: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).pick({
  userId: true,
  action: true,
  entityType: true,
  entityId: true,
  details: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Indicator = typeof indicators.$inferSelect;
export type InsertIndicator = z.infer<typeof insertIndicatorSchema>;

export type IndicatorValue = typeof indicatorValues.$inferSelect;
export type InsertIndicatorValue = z.infer<typeof insertIndicatorValueSchema>;

export type FormTemplate = typeof formTemplates.$inferSelect;
export type InsertFormTemplate = z.infer<typeof insertFormTemplateSchema>;

export type FormSubmission = typeof formSubmissions.$inferSelect;
export type InsertFormSubmission = z.infer<typeof insertFormSubmissionSchema>;

export type EsgScore = typeof esgScores.$inferSelect;
export type InsertEsgScore = z.infer<typeof insertEsgScoreSchema>;

export type SdgGoal = typeof sdgGoals.$inferSelect;
export type InsertSdgGoal = z.infer<typeof insertSdgGoalSchema>;

export type ProjectSdgMapping = typeof projectSdgMappings.$inferSelect;
export type InsertProjectSdgMapping = z.infer<typeof insertProjectSdgMappingSchema>;

export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;

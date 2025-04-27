import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertProjectSchema, 
  insertIndicatorSchema, 
  insertIndicatorValueSchema,
  insertFormTemplateSchema,
  insertFormSubmissionSchema,
  insertProjectSdgMappingSchema,
  insertReportSchema
} from "@shared/schema";
import { zodErrorToString } from "./utils";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up auth routes
  setupAuth(app);

  // Temporary route for debug
  app.get("/api/debug-auth", async (req, res) => {
    try {
      const username = "admin";
      const password = "admin123";
      console.log("Debugging auth for:", username);

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(404).json({ message: "User not found", username });
      }

      console.log("User found:", { id: user.id, username: user.username });
      console.log("Stored password hash:", user.password);

      // Import the password comparison function
      const { comparePasswords } = require("./auth");

      // Test if the password matches
      const passwordMatches = await comparePasswords(password, user.password);
      console.log("Password match result:", passwordMatches);

      res.json({ 
        userFound: true, 
        passwordMatches,
        tryLogin: passwordMatches ? "Login should work" : "Login will fail"
      });
    } catch (error) {
      console.error("Auth debug error:", error);
      res.status(500).json({ error: String(error) });
    }
  });

  // Create new admin user
  app.get("/api/admin-setup", async (req, res) => {
    try {
      // Import the hashPassword function
      const { hashPassword } = require("./auth");

      // Check if admin user already exists
      const existingUser = await storage.getUserByUsername("new_admin");

      if (existingUser) {
        return res.json({ 
          message: "Admin user already exists", 
          username: "new_admin",
          note: "Try logging in with username 'new_admin' and password 'password123'"
        });
      }

      // Create a new admin user with a known password
      const hashedPassword = await hashPassword("password123");

      const newAdmin = await storage.createUser({
        username: "new_admin",
        password: hashedPassword,
        fullName: "New Administrator",
        email: "new_admin@example.com",
        role: "admin"
      });

      // Create a default organization if it doesn't exist
      let organization = await storage.getOrganization(1);

      if (!organization) {
        organization = await storage.createOrganization({
          name: "Default Organization",
          industry: "Technology"
        });
      }

      res.json({ 
        success: true, 
        message: "Admin user created successfully",
        username: "new_admin",
        password: "password123",
        note: "Use these credentials to log in"
      });
    } catch (error) {
      console.error("Admin setup error:", error);
      res.status(500).json({ error: String(error) });
    }
  });

  // API Routes - All prefixed with /api

  // Projects
  app.get("/api/projects", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const category = req.query.category as string | undefined;
      const orgId = req.query.organizationId ? parseInt(req.query.organizationId as string) : undefined;

      let projects;
      if (category) {
        projects = await storage.getProjectsByCategory(category);
      } else if (orgId) {
        projects = await storage.getProjectsByOrganization(orgId);
      } else {
        projects = await storage.getProjects();
      }

      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects", error: String(error) });
    }
  });

  app.get("/api/projects/:id", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProject(id);

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project", error: String(error) });
    }
  });

  app.post("/api/projects", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const parseResult = insertProjectSchema.safeParse(req.body);

      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Invalid project data", 
          errors: zodErrorToString(parseResult.error) 
        });
      }

      // Add the current user as creator
      const projectData = {
        ...parseResult.data,
        createdById: req.user!.id
      };

      const project = await storage.createProject(projectData);

      // Create audit log
      await storage.createAuditLog({
        userId: req.user!.id,
        action: "create",
        entityType: "project",
        entityId: project.id,
        details: { projectName: project.name }
      });

      res.status(201).json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to create project", error: String(error) });
    }
  });

  app.patch("/api/projects/:id", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProject(id);

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const updatedProject = await storage.updateProject(id, req.body);

      // Create audit log
      await storage.createAuditLog({
        userId: req.user!.id,
        action: "update",
        entityType: "project",
        entityId: id,
        details: { projectName: project.name, changes: req.body }
      });

      res.json(updatedProject);
    } catch (error) {
      res.status(500).json({ message: "Failed to update project", error: String(error) });
    }
  });

  app.delete("/api/projects/:id", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user!.role !== 'admin') return res.status(403).json({ message: "Forbidden" });

    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProject(id);

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const success = await storage.deleteProject(id);

      if (success) {
        // Create audit log
        await storage.createAuditLog({
          userId: req.user!.id,
          action: "delete",
          entityType: "project",
          entityId: id,
          details: { projectName: project.name }
        });

        res.status(204).send();
      } else {
        res.status(500).json({ message: "Failed to delete project" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete project", error: String(error) });
    }
  });

  // Indicators
  app.get("/api/indicators", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
      const category = req.query.category as string | undefined;

      let indicators;
      if (projectId) {
        indicators = await storage.getIndicatorsByProject(projectId);
      } else if (category) {
        indicators = await storage.getIndicatorsByCategory(category);
      } else {
        return res.status(400).json({ message: "Must provide projectId or category" });
      }

      res.json(indicators);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch indicators", error: String(error) });
    }
  });

  app.post("/api/indicators", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const parseResult = insertIndicatorSchema.safeParse(req.body);

      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Invalid indicator data", 
          errors: zodErrorToString(parseResult.error) 
        });
      }

      // Add the current user as creator
      const indicatorData = {
        ...parseResult.data,
        createdById: req.user!.id
      };

      const indicator = await storage.createIndicator(indicatorData);

      // Create audit log
      await storage.createAuditLog({
        userId: req.user!.id,
        action: "create",
        entityType: "indicator",
        entityId: indicator.id,
        details: { indicatorName: indicator.name }
      });

      res.status(201).json(indicator);
    } catch (error) {
      res.status(500).json({ message: "Failed to create indicator", error: String(error) });
    }
  });

  // Indicator Values
  app.post("/api/indicator-values", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const parseResult = insertIndicatorValueSchema.safeParse(req.body);

      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Invalid indicator value data", 
          errors: zodErrorToString(parseResult.error) 
        });
      }

      // Add the current user as submitter
      const valueData = {
        ...parseResult.data,
        submittedById: req.user!.id
      };

      const value = await storage.createIndicatorValue(valueData);

      // Create audit log
      await storage.createAuditLog({
        userId: req.user!.id,
        action: "create",
        entityType: "indicator_value",
        entityId: value.id,
        details: { indicatorId: value.indicatorId, value: value.value }
      });

      res.status(201).json(value);
    } catch (error) {
      res.status(500).json({ message: "Failed to create indicator value", error: String(error) });
    }
  });

  app.get("/api/indicator-values/:indicatorId", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const indicatorId = parseInt(req.params.indicatorId);
      const values = await storage.getIndicatorValues(indicatorId);

      res.json(values);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch indicator values", error: String(error) });
    }
  });

  // Form Templates
  app.post("/api/form-templates", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const parseResult = insertFormTemplateSchema.safeParse(req.body);

      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Invalid form template data", 
          errors: zodErrorToString(parseResult.error) 
        });
      }

      // Add the current user as creator
      const templateData = {
        ...parseResult.data,
        createdById: req.user!.id
      };

      const template = await storage.createFormTemplate(templateData);

      // Create audit log
      await storage.createAuditLog({
        userId: req.user!.id,
        action: "create",
        entityType: "form_template",
        entityId: template.id,
        details: { templateName: template.name }
      });

      res.status(201).json(template);
    } catch (error) {
      res.status(500).json({ message: "Failed to create form template", error: String(error) });
    }
  });

  app.get("/api/form-templates/:projectId", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const projectId = parseInt(req.params.projectId);
      const templates = await storage.getFormTemplatesByProject(projectId);

      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch form templates", error: String(error) });
    }
  });

  // Form Submissions
  app.post("/api/form-submissions", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const parseResult = insertFormSubmissionSchema.safeParse(req.body);

      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Invalid form submission data", 
          errors: zodErrorToString(parseResult.error) 
        });
      }

      // Add the current user as submitter
      const submissionData = {
        ...parseResult.data,
        submittedById: req.user!.id
      };

      const submission = await storage.createFormSubmission(submissionData);

      // Create audit log
      await storage.createAuditLog({
        userId: req.user!.id,
        action: "create",
        entityType: "form_submission",
        entityId: submission.id,
        details: { formTemplateId: submission.formTemplateId }
      });

      res.status(201).json(submission);
    } catch (error) {
      res.status(500).json({ message: "Failed to create form submission", error: String(error) });
    }
  });

  // ESG Scores
  app.get("/api/esg-scores/:orgId", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const orgId = parseInt(req.params.orgId);
      const latest = req.query.latest === 'true';

      if (latest) {
        const score = await storage.getLatestEsgScore(orgId);
        if (!score) {
          return res.status(404).json({ message: "No ESG scores found for this organization" });
        }
        return res.json(score);
      }

      const scores = await storage.getEsgScoreHistory(orgId);
      res.json(scores);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ESG scores", error: String(error) });
    }
  });

  // SDG Goals
  app.get("/api/sdg-goals", async (req: Request, res: Response) => {
    try {
      const goals = await storage.getSdgGoals();
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch SDG goals", error: String(error) });
    }
  });

  // Project SDG Mappings
  app.post("/api/project-sdg-mappings", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const parseResult = insertProjectSdgMappingSchema.safeParse(req.body);

      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Invalid project SDG mapping data", 
          errors: zodErrorToString(parseResult.error) 
        });
      }

      // Add the current user as creator
      const mappingData = {
        ...parseResult.data,
        createdById: req.user!.id
      };

      const mapping = await storage.createProjectSdgMapping(mappingData);

      // Create audit log
      await storage.createAuditLog({
        userId: req.user!.id,
        action: "create",
        entityType: "project_sdg_mapping",
        entityId: mapping.id,
        details: { 
          projectId: mapping.projectId, 
          sdgId: mapping.sdgId,
          impactLevel: mapping.impactLevel
        }
      });

      res.status(201).json(mapping);
    } catch (error) {
      res.status(500).json({ message: "Failed to create project SDG mapping", error: String(error) });
    }
  });

  app.get("/api/project-sdg-mappings/:projectId", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const projectId = parseInt(req.params.projectId);
      const mappings = await storage.getProjectSdgMappings(projectId);

      res.json(mappings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project SDG mappings", error: String(error) });
    }
  });

  // Reports
  app.post("/api/reports", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const parseResult = insertReportSchema.safeParse(req.body);

      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Invalid report data", 
          errors: zodErrorToString(parseResult.error) 
        });
      }

      // Add the current user as creator
      const reportData = {
        ...parseResult.data,
        createdById: req.user!.id
      };

      const report = await storage.createReport(reportData);

      // Create audit log
      await storage.createAuditLog({
        userId: req.user!.id,
        action: "create",
        entityType: "report",
        entityId: report.id,
        details: { 
          reportName: report.name,
          reportType: report.type
        }
      });

      res.status(201).json(report);
    } catch (error) {
      res.status(500).json({ message: "Failed to create report", error: String(error) });
    }
  });

  // Notifications
  app.get("/api/notifications", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const notifications = await storage.getUserNotifications(req.user!.id);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications", error: String(error) });
    }
  });

  app.post("/api/notifications/:id/read", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const id = parseInt(req.params.id);
      const success = await storage.markNotificationAsRead(id);

      if (success) {
        res.status(204).send();
      } else {
        res.status(404).json({ message: "Notification not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read", error: String(error) });
    }
  });

  // Generate the PDF/Excel report endpoint
  app.get("/api/export-report/:reportId", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const reportId = parseInt(req.params.reportId);
      const report = await storage.getReport(reportId);

      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }

      // In a real implementation, this would generate the actual PDF/Excel file
      // For now, we'll return a mock response
      res.json({
        reportId,
        reportName: report.name,
        reportType: report.type,
        format: report.format,
        downloadUrl: `/api/download-report/${reportId}`,
        generatedAt: new Date()
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to export report", error: String(error) });
    }
  });

  app.post("/api/logout", (req, res) => {
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ message: "Could not log out" });
        }
        res.clearCookie('connect.sid');
        res.status(200).json({ message: "Logged out successfully" });
      });
    } else {
      res.status(200).json({ message: "Already logged out" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to convert Zod errors to string
function zodErrorToString(error: any): string {
  if (!error || !error.errors) return 'Invalid data';
  return error.errors.map((err: any) => `${err.path.join('.')}: ${err.message}`).join(', ');
}
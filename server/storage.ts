import session from "express-session";
import createMemoryStore from "memorystore";
import { 
  users, User, InsertUser, 
  projects, Project, InsertProject,
  indicators, Indicator, InsertIndicator,
  indicatorValues, IndicatorValue, InsertIndicatorValue,
  formTemplates, FormTemplate, InsertFormTemplate,
  formSubmissions, FormSubmission, InsertFormSubmission,
  esgScores, EsgScore, InsertEsgScore,
  sdgGoals, SdgGoal, InsertSdgGoal,
  projectSdgMappings, ProjectSdgMapping, InsertProjectSdgMapping,
  reports, Report, InsertReport,
  notifications, Notification, InsertNotification,
  auditLogs, AuditLog, InsertAuditLog,
  organizations, Organization, InsertOrganization
} from "@shared/schema";

const MemoryStore = createMemoryStore(session);

// Storage interface
export interface IStorage {
  // Session store
  sessionStore: session.SessionStore;
  
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<User[]>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Organizations
  createOrganization(org: InsertOrganization): Promise<Organization>;
  getOrganization(id: number): Promise<Organization | undefined>;
  getOrganizations(): Promise<Organization[]>;
  
  // Projects
  createProject(project: InsertProject): Promise<Project>;
  getProject(id: number): Promise<Project | undefined>;
  getProjects(): Promise<Project[]>;
  getProjectsByOrganization(orgId: number): Promise<Project[]>;
  getProjectsByCategory(category: string): Promise<Project[]>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  
  // Indicators
  createIndicator(indicator: InsertIndicator): Promise<Indicator>;
  getIndicator(id: number): Promise<Indicator | undefined>;
  getIndicatorsByProject(projectId: number): Promise<Indicator[]>;
  getIndicatorsByCategory(category: string): Promise<Indicator[]>;
  updateIndicator(id: number, indicator: Partial<InsertIndicator>): Promise<Indicator | undefined>;
  
  // Indicator Values
  createIndicatorValue(value: InsertIndicatorValue): Promise<IndicatorValue>;
  getIndicatorValues(indicatorId: number): Promise<IndicatorValue[]>;
  getIndicatorValuesByProject(projectId: number): Promise<IndicatorValue[]>;
  
  // Form Templates
  createFormTemplate(template: InsertFormTemplate): Promise<FormTemplate>;
  getFormTemplate(id: number): Promise<FormTemplate | undefined>;
  getFormTemplatesByProject(projectId: number): Promise<FormTemplate[]>;
  
  // Form Submissions
  createFormSubmission(submission: InsertFormSubmission): Promise<FormSubmission>;
  getFormSubmissions(templateId: number): Promise<FormSubmission[]>;
  
  // ESG Scores
  createEsgScore(score: InsertEsgScore): Promise<EsgScore>;
  getLatestEsgScore(orgId: number): Promise<EsgScore | undefined>;
  getEsgScoreHistory(orgId: number): Promise<EsgScore[]>;
  
  // SDG Goals
  createSdgGoal(goal: InsertSdgGoal): Promise<SdgGoal>;
  getSdgGoal(id: number): Promise<SdgGoal | undefined>;
  getSdgGoals(): Promise<SdgGoal[]>;
  
  // Project SDG Mappings
  createProjectSdgMapping(mapping: InsertProjectSdgMapping): Promise<ProjectSdgMapping>;
  getProjectSdgMappings(projectId: number): Promise<ProjectSdgMapping[]>;
  
  // Reports
  createReport(report: InsertReport): Promise<Report>;
  getReport(id: number): Promise<Report | undefined>;
  getReportsByType(type: string): Promise<Report[]>;
  
  // Notifications
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: number): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<boolean>;
  
  // Audit Logs
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(): Promise<AuditLog[]>;
  getUserAuditLogs(userId: number): Promise<AuditLog[]>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  sessionStore: session.SessionStore;
  
  private usersMap: Map<number, User>;
  private organizationsMap: Map<number, Organization>;
  private projectsMap: Map<number, Project>;
  private indicatorsMap: Map<number, Indicator>;
  private indicatorValuesMap: Map<number, IndicatorValue>;
  private formTemplatesMap: Map<number, FormTemplate>;
  private formSubmissionsMap: Map<number, FormSubmission>;
  private esgScoresMap: Map<number, EsgScore>;
  private sdgGoalsMap: Map<number, SdgGoal>;
  private projectSdgMappingsMap: Map<number, ProjectSdgMapping>;
  private reportsMap: Map<number, Report>;
  private notificationsMap: Map<number, Notification>;
  private auditLogsMap: Map<number, AuditLog>;
  
  // Auto-incrementing IDs
  private userId = 1;
  private organizationId = 1;
  private projectId = 1;
  private indicatorId = 1;
  private indicatorValueId = 1;
  private formTemplateId = 1;
  private formSubmissionId = 1;
  private esgScoreId = 1;
  private sdgGoalId = 1;
  private projectSdgMappingId = 1;
  private reportId = 1;
  private notificationId = 1;
  private auditLogId = 1;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24h
    });
    
    this.usersMap = new Map();
    this.organizationsMap = new Map();
    this.projectsMap = new Map();
    this.indicatorsMap = new Map();
    this.indicatorValuesMap = new Map();
    this.formTemplatesMap = new Map();
    this.formSubmissionsMap = new Map();
    this.esgScoresMap = new Map();
    this.sdgGoalsMap = new Map();
    this.projectSdgMappingsMap = new Map();
    this.reportsMap = new Map();
    this.notificationsMap = new Map();
    this.auditLogsMap = new Map();
    
    // Initial SDG goals data
    this.seedSdgGoals();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.usersMap.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const newUser: User = { 
      ...user, 
      id,
      createdAt: new Date() 
    };
    this.usersMap.set(id, newUser);
    return newUser;
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.usersMap.values());
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.usersMap.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.usersMap.set(id, updatedUser);
    return updatedUser;
  }

  // Organization methods
  async createOrganization(org: InsertOrganization): Promise<Organization> {
    const id = this.organizationId++;
    const newOrg: Organization = { 
      ...org, 
      id,
      createdAt: new Date() 
    };
    this.organizationsMap.set(id, newOrg);
    return newOrg;
  }

  async getOrganization(id: number): Promise<Organization | undefined> {
    return this.organizationsMap.get(id);
  }

  async getOrganizations(): Promise<Organization[]> {
    return Array.from(this.organizationsMap.values());
  }

  // Project methods
  async createProject(project: InsertProject): Promise<Project> {
    const id = this.projectId++;
    const now = new Date();
    const newProject: Project = {
      ...project,
      id,
      lastUpdated: now
    };
    this.projectsMap.set(id, newProject);
    return newProject;
  }

  async getProject(id: number): Promise<Project | undefined> {
    return this.projectsMap.get(id);
  }

  async getProjects(): Promise<Project[]> {
    return Array.from(this.projectsMap.values());
  }

  async getProjectsByOrganization(orgId: number): Promise<Project[]> {
    return Array.from(this.projectsMap.values()).filter(
      project => project.organizationId === orgId
    );
  }

  async getProjectsByCategory(category: string): Promise<Project[]> {
    return Array.from(this.projectsMap.values()).filter(
      project => project.category === category
    );
  }

  async updateProject(id: number, projectData: Partial<InsertProject>): Promise<Project | undefined> {
    const project = this.projectsMap.get(id);
    if (!project) return undefined;
    
    const updatedProject = { 
      ...project, 
      ...projectData,
      lastUpdated: new Date()
    };
    this.projectsMap.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    return this.projectsMap.delete(id);
  }

  // Indicator methods
  async createIndicator(indicator: InsertIndicator): Promise<Indicator> {
    const id = this.indicatorId++;
    const newIndicator: Indicator = { ...indicator, id };
    this.indicatorsMap.set(id, newIndicator);
    return newIndicator;
  }

  async getIndicator(id: number): Promise<Indicator | undefined> {
    return this.indicatorsMap.get(id);
  }

  async getIndicatorsByProject(projectId: number): Promise<Indicator[]> {
    return Array.from(this.indicatorsMap.values()).filter(
      indicator => indicator.projectId === projectId
    );
  }

  async getIndicatorsByCategory(category: string): Promise<Indicator[]> {
    return Array.from(this.indicatorsMap.values()).filter(
      indicator => indicator.category === category
    );
  }

  async updateIndicator(id: number, indicatorData: Partial<InsertIndicator>): Promise<Indicator | undefined> {
    const indicator = this.indicatorsMap.get(id);
    if (!indicator) return undefined;
    
    const updatedIndicator = { ...indicator, ...indicatorData };
    this.indicatorsMap.set(id, updatedIndicator);
    return updatedIndicator;
  }

  // Indicator Values methods
  async createIndicatorValue(value: InsertIndicatorValue): Promise<IndicatorValue> {
    const id = this.indicatorValueId++;
    const now = new Date();
    const newValue: IndicatorValue = {
      ...value,
      id,
      date: value.date || now
    };
    this.indicatorValuesMap.set(id, newValue);
    return newValue;
  }

  async getIndicatorValues(indicatorId: number): Promise<IndicatorValue[]> {
    return Array.from(this.indicatorValuesMap.values()).filter(
      value => value.indicatorId === indicatorId
    );
  }

  async getIndicatorValuesByProject(projectId: number): Promise<IndicatorValue[]> {
    return Array.from(this.indicatorValuesMap.values()).filter(
      value => value.projectId === projectId
    );
  }

  // Form Templates methods
  async createFormTemplate(template: InsertFormTemplate): Promise<FormTemplate> {
    const id = this.formTemplateId++;
    const now = new Date();
    const newTemplate: FormTemplate = {
      ...template,
      id,
      createdAt: now
    };
    this.formTemplatesMap.set(id, newTemplate);
    return newTemplate;
  }

  async getFormTemplate(id: number): Promise<FormTemplate | undefined> {
    return this.formTemplatesMap.get(id);
  }

  async getFormTemplatesByProject(projectId: number): Promise<FormTemplate[]> {
    return Array.from(this.formTemplatesMap.values()).filter(
      template => template.projectId === projectId
    );
  }

  // Form Submissions methods
  async createFormSubmission(submission: InsertFormSubmission): Promise<FormSubmission> {
    const id = this.formSubmissionId++;
    const now = new Date();
    const newSubmission: FormSubmission = {
      ...submission,
      id,
      submittedAt: now
    };
    this.formSubmissionsMap.set(id, newSubmission);
    return newSubmission;
  }

  async getFormSubmissions(templateId: number): Promise<FormSubmission[]> {
    return Array.from(this.formSubmissionsMap.values()).filter(
      submission => submission.formTemplateId === templateId
    );
  }

  // ESG Scores methods
  async createEsgScore(score: InsertEsgScore): Promise<EsgScore> {
    const id = this.esgScoreId++;
    const now = new Date();
    const newScore: EsgScore = {
      ...score,
      id,
      calculatedAt: now
    };
    this.esgScoresMap.set(id, newScore);
    return newScore;
  }

  async getLatestEsgScore(orgId: number): Promise<EsgScore | undefined> {
    const orgScores = Array.from(this.esgScoresMap.values())
      .filter(score => score.organizationId === orgId)
      .sort((a, b) => b.calculatedAt.getTime() - a.calculatedAt.getTime());
    
    return orgScores.length > 0 ? orgScores[0] : undefined;
  }

  async getEsgScoreHistory(orgId: number): Promise<EsgScore[]> {
    return Array.from(this.esgScoresMap.values())
      .filter(score => score.organizationId === orgId)
      .sort((a, b) => a.calculatedAt.getTime() - b.calculatedAt.getTime());
  }

  // SDG Goals methods
  async createSdgGoal(goal: InsertSdgGoal): Promise<SdgGoal> {
    const id = this.sdgGoalId++;
    const newGoal: SdgGoal = { ...goal, id };
    this.sdgGoalsMap.set(id, newGoal);
    return newGoal;
  }

  async getSdgGoal(id: number): Promise<SdgGoal | undefined> {
    return this.sdgGoalsMap.get(id);
  }

  async getSdgGoals(): Promise<SdgGoal[]> {
    return Array.from(this.sdgGoalsMap.values());
  }

  // Project SDG Mappings methods
  async createProjectSdgMapping(mapping: InsertProjectSdgMapping): Promise<ProjectSdgMapping> {
    const id = this.projectSdgMappingId++;
    const newMapping: ProjectSdgMapping = { ...mapping, id };
    this.projectSdgMappingsMap.set(id, newMapping);
    return newMapping;
  }

  async getProjectSdgMappings(projectId: number): Promise<ProjectSdgMapping[]> {
    return Array.from(this.projectSdgMappingsMap.values()).filter(
      mapping => mapping.projectId === projectId
    );
  }

  // Reports methods
  async createReport(report: InsertReport): Promise<Report> {
    const id = this.reportId++;
    const now = new Date();
    const newReport: Report = {
      ...report,
      id,
      createdAt: now
    };
    this.reportsMap.set(id, newReport);
    return newReport;
  }

  async getReport(id: number): Promise<Report | undefined> {
    return this.reportsMap.get(id);
  }

  async getReportsByType(type: string): Promise<Report[]> {
    return Array.from(this.reportsMap.values()).filter(
      report => report.type === type
    );
  }

  // Notifications methods
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = this.notificationId++;
    const now = new Date();
    const newNotification: Notification = {
      ...notification,
      id,
      read: false,
      createdAt: now
    };
    this.notificationsMap.set(id, newNotification);
    return newNotification;
  }

  async getUserNotifications(userId: number): Promise<Notification[]> {
    return Array.from(this.notificationsMap.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async markNotificationAsRead(id: number): Promise<boolean> {
    const notification = this.notificationsMap.get(id);
    if (!notification) return false;
    
    notification.read = true;
    this.notificationsMap.set(id, notification);
    return true;
  }

  // Audit Logs methods
  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const id = this.auditLogId++;
    const now = new Date();
    const newLog: AuditLog = {
      ...log,
      id,
      timestamp: now
    };
    this.auditLogsMap.set(id, newLog);
    return newLog;
  }

  async getAuditLogs(): Promise<AuditLog[]> {
    return Array.from(this.auditLogsMap.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getUserAuditLogs(userId: number): Promise<AuditLog[]> {
    return Array.from(this.auditLogsMap.values())
      .filter(log => log.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Seed initial SDG goals
  private seedSdgGoals() {
    const sdgData = [
      { number: 1, name: "No Poverty", description: "End poverty in all its forms everywhere", color: "#E5243B" },
      { number: 2, name: "Zero Hunger", description: "End hunger, achieve food security and improved nutrition and promote sustainable agriculture", color: "#DDA63A" },
      { number: 3, name: "Good Health and Well-being", description: "Ensure healthy lives and promote well-being for all at all ages", color: "#4C9F38" },
      { number: 4, name: "Quality Education", description: "Ensure inclusive and equitable quality education and promote lifelong learning opportunities for all", color: "#C5192D" },
      { number: 5, name: "Gender Equality", description: "Achieve gender equality and empower all women and girls", color: "#FF3A21" },
      { number: 6, name: "Clean Water and Sanitation", description: "Ensure availability and sustainable management of water and sanitation for all", color: "#26BDE2" },
      { number: 7, name: "Affordable and Clean Energy", description: "Ensure access to affordable, reliable, sustainable and modern energy for all", color: "#FCC30B" },
      { number: 8, name: "Decent Work and Economic Growth", description: "Promote sustained, inclusive and sustainable economic growth, full and productive employment and decent work for all", color: "#A21942" },
      { number: 9, name: "Industry, Innovation and Infrastructure", description: "Build resilient infrastructure, promote inclusive and sustainable industrialization and foster innovation", color: "#FD6925" },
      { number: 10, name: "Reduced Inequalities", description: "Reduce inequality within and among countries", color: "#DD1367" },
      { number: 11, name: "Sustainable Cities and Communities", description: "Make cities and human settlements inclusive, safe, resilient and sustainable", color: "#FD9D24" },
      { number: 12, name: "Responsible Consumption and Production", description: "Ensure sustainable consumption and production patterns", color: "#BF8B2E" },
      { number: 13, name: "Climate Action", description: "Take urgent action to combat climate change and its impacts", color: "#3F7E44" },
      { number: 14, name: "Life Below Water", description: "Conserve and sustainably use the oceans, seas and marine resources for sustainable development", color: "#0A97D9" },
      { number: 15, name: "Life on Land", description: "Protect, restore and promote sustainable use of terrestrial ecosystems", color: "#56C02B" },
      { number: 16, name: "Peace, Justice and Strong Institutions", description: "Promote peaceful and inclusive societies for sustainable development", color: "#00689D" },
      { number: 17, name: "Partnerships for the Goals", description: "Strengthen the means of implementation and revitalize the global partnership for sustainable development", color: "#19486A" }
    ];

    sdgData.forEach(sdg => {
      const id = this.sdgGoalId++;
      this.sdgGoalsMap.set(id, { ...sdg, id });
    });
  }
}

export const storage = new MemStorage();

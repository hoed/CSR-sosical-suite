-- Social Impact Reporting and Monitoring Database Schema

-- USERS TABLE
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'contributor', -- admin, contributor, reviewer
  organization_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ORGANIZATIONS TABLE
CREATE TABLE organizations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  industry TEXT,
  logo TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- PROJECTS TABLE
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  category TEXT NOT NULL, -- Environmental, Social, Governance
  status TEXT NOT NULL DEFAULT 'planned', -- planned, in_progress, completed, delayed, at_risk
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  completion REAL DEFAULT 0, -- 0-100 percent
  impact_score INTEGER, -- 0-100
  organization_id INTEGER REFERENCES organizations(id),
  created_by_id INTEGER REFERENCES users(id),
  last_updated TIMESTAMP DEFAULT NOW()
);

-- INDICATORS TABLE (impact metrics)
CREATE TABLE indicators (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- environmental, social, governance
  unit TEXT, -- e.g., tons, people, percent
  data_type TEXT NOT NULL, -- number, text, boolean, date
  project_id INTEGER REFERENCES projects(id),
  created_by_id INTEGER REFERENCES users(id),
  customizable BOOLEAN DEFAULT TRUE
);

-- INDICATOR VALUES TABLE
CREATE TABLE indicator_values (
  id SERIAL PRIMARY KEY,
  indicator_id INTEGER REFERENCES indicators(id) NOT NULL,
  project_id INTEGER REFERENCES projects(id) NOT NULL,
  value TEXT NOT NULL, -- Stored as text, converted based on data_type
  date TIMESTAMP DEFAULT NOW(),
  submitted_by_id INTEGER REFERENCES users(id)
);

-- FORM TEMPLATES TABLE
CREATE TABLE form_templates (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  fields JSONB NOT NULL, -- JSON structure defining form fields
  project_id INTEGER REFERENCES projects(id),
  created_by_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- FORM SUBMISSIONS TABLE
CREATE TABLE form_submissions (
  id SERIAL PRIMARY KEY,
  form_template_id INTEGER REFERENCES form_templates(id) NOT NULL,
  data JSONB NOT NULL,
  submitted_by_id INTEGER REFERENCES users(id),
  submitted_at TIMESTAMP DEFAULT NOW()
);

-- ESG SCORES TABLE
CREATE TABLE esg_scores (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER REFERENCES organizations(id) NOT NULL,
  environmental_score INTEGER, -- 0-100
  social_score INTEGER, -- 0-100
  governance_score INTEGER, -- 0-100
  period TEXT NOT NULL, -- e.g., "Q3 2023"
  calculated_at TIMESTAMP DEFAULT NOW()
);

-- SDG GOALS TABLE
CREATE TABLE sdg_goals (
  id SERIAL PRIMARY KEY,
  number INTEGER NOT NULL, -- 1-17
  name TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL
);

-- PROJECT SDG MAPPINGS TABLE
CREATE TABLE project_sdg_mappings (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) NOT NULL,
  sdg_id INTEGER REFERENCES sdg_goals(id) NOT NULL,
  impact_level TEXT NOT NULL, -- weak, medium, strong
  notes TEXT,
  created_by_id INTEGER REFERENCES users(id)
);

-- REPORTS TABLE
CREATE TABLE reports (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL, -- project, impact, sdg
  format TEXT NOT NULL, -- pdf, excel
  parameters JSONB, -- Filter/configuration parameters
  created_by_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- NOTIFICATIONS TABLE
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL, -- reminder, alert, info
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- AUDIT LOGS TABLE
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL, -- user, project, indicator, etc.
  entity_id INTEGER,
  details JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Seed SDG Goals data
INSERT INTO sdg_goals (number, name, description, color) VALUES
(1, 'No Poverty', 'End poverty in all its forms everywhere', '#E5243B'),
(2, 'Zero Hunger', 'End hunger, achieve food security and improved nutrition and promote sustainable agriculture', '#DDA63A'),
(3, 'Good Health and Well-being', 'Ensure healthy lives and promote well-being for all at all ages', '#4C9F38'),
(4, 'Quality Education', 'Ensure inclusive and equitable quality education and promote lifelong learning opportunities for all', '#C5192D'),
(5, 'Gender Equality', 'Achieve gender equality and empower all women and girls', '#FF3A21'),
(6, 'Clean Water and Sanitation', 'Ensure availability and sustainable management of water and sanitation for all', '#26BDE2'),
(7, 'Affordable and Clean Energy', 'Ensure access to affordable, reliable, sustainable and modern energy for all', '#FCC30B'),
(8, 'Decent Work and Economic Growth', 'Promote sustained, inclusive and sustainable economic growth, full and productive employment and decent work for all', '#A21942'),
(9, 'Industry, Innovation and Infrastructure', 'Build resilient infrastructure, promote inclusive and sustainable industrialization and foster innovation', '#FD6925'),
(10, 'Reduced Inequality', 'Reduce inequality within and among countries', '#DD1367'),
(11, 'Sustainable Cities and Communities', 'Make cities and human settlements inclusive, safe, resilient and sustainable', '#FD9D24'),
(12, 'Responsible Consumption and Production', 'Ensure sustainable consumption and production patterns', '#BF8B2E'),
(13, 'Climate Action', 'Take urgent action to combat climate change and its impacts', '#3F7E44'),
(14, 'Life Below Water', 'Conserve and sustainably use the oceans, seas and marine resources for sustainable development', '#0A97D9'),
(15, 'Life on Land', 'Protect, restore and promote sustainable use of terrestrial ecosystems, sustainably manage forests, combat desertification, and halt and reverse land degradation and halt biodiversity loss', '#56C02B'),
(16, 'Peace, Justice and Strong Institutions', 'Promote peaceful and inclusive societies for sustainable development, provide access to justice for all and build effective, accountable and inclusive institutions at all levels', '#00689D'),
(17, 'Partnerships for the Goals', 'Strengthen the means of implementation and revitalize the global partnership for sustainable development', '#19486A');

-- Create index on commonly queried fields
CREATE INDEX idx_projects_organization ON projects(organization_id);
CREATE INDEX idx_indicators_project ON indicators(project_id);
CREATE INDEX idx_indicator_values_indicator ON indicator_values(indicator_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_form_templates_project ON form_templates(project_id);
CREATE INDEX idx_project_sdg_mappings_project ON project_sdg_mappings(project_id);
CREATE INDEX idx_esg_scores_organization ON esg_scores(organization_id);
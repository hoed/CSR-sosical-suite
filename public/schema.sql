-- Social Impact Reporting and Monitoring Database Schema

-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'contributor',
  organization_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ORGANIZATIONS TABLE
CREATE TABLE IF NOT EXISTS organizations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  industry TEXT,
  logo TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- PROJECTS TABLE
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'planned',
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  completion REAL DEFAULT 0,
  impact_score INTEGER,
  organization_id INTEGER REFERENCES organizations(id),
  created_by_id INTEGER REFERENCES users(id),
  last_updated TIMESTAMP DEFAULT NOW()
);

-- INDICATORS TABLE (impact metrics)
CREATE TABLE IF NOT EXISTS indicators (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  unit TEXT,
  data_type TEXT NOT NULL,
  project_id INTEGER REFERENCES projects(id),
  created_by_id INTEGER REFERENCES users(id),
  customizable BOOLEAN DEFAULT TRUE
);

-- INDICATOR VALUES TABLE
CREATE TABLE IF NOT EXISTS indicator_values (
  id SERIAL PRIMARY KEY,
  indicator_id INTEGER REFERENCES indicators(id) NOT NULL,
  project_id INTEGER REFERENCES projects(id) NOT NULL,
  value TEXT NOT NULL,
  date TIMESTAMP DEFAULT NOW(),
  submitted_by_id INTEGER REFERENCES users(id)
);

-- FORM TEMPLATES TABLE
CREATE TABLE IF NOT EXISTS form_templates (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  fields JSONB NOT NULL,
  project_id INTEGER REFERENCES projects(id),
  created_by_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- FORM SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS form_submissions (
  id SERIAL PRIMARY KEY,
  form_template_id INTEGER REFERENCES form_templates(id) NOT NULL,
  data JSONB NOT NULL,
  submitted_by_id INTEGER REFERENCES users(id),
  submitted_at TIMESTAMP DEFAULT NOW()
);

-- ESG SCORES TABLE
CREATE TABLE IF NOT EXISTS esg_scores (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER REFERENCES organizations(id) NOT NULL,
  environmental_score INTEGER,
  social_score INTEGER,
  governance_score INTEGER,
  period TEXT NOT NULL,
  calculated_at TIMESTAMP DEFAULT NOW()
);

-- SDG GOALS TABLE
CREATE TABLE IF NOT EXISTS sdg_goals (
  id SERIAL PRIMARY KEY,
  number INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL
);

-- PROJECT SDG MAPPINGS TABLE
CREATE TABLE IF NOT EXISTS project_sdg_mappings (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) NOT NULL,
  sdg_id INTEGER REFERENCES sdg_goals(id) NOT NULL,
  impact_level TEXT NOT NULL,
  notes TEXT,
  created_by_id INTEGER REFERENCES users(id)
);

-- REPORTS TABLE
CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  format TEXT NOT NULL,
  parameters JSONB,
  created_by_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id INTEGER,
  details JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_organization ON projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_indicators_project ON indicators(project_id);
CREATE INDEX IF NOT EXISTS idx_indicator_values_indicator ON indicator_values(indicator_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_users_organization ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_form_templates_project ON form_templates(project_id);
CREATE INDEX IF NOT EXISTS idx_project_sdg_mappings_project ON project_sdg_mappings(project_id);
CREATE INDEX IF NOT EXISTS idx_esg_scores_organization ON esg_scores(organization_id);

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

import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Pool, neonConfig } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

async function setupDatabase() {
  const pool = new Pool({ connectionString: DATABASE_URL });

  try {
    // Read the schema SQL file
    const schemaPath = join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Setting up database...');
    
    // Execute the schema SQL
    await pool.query(schemaSql);
    
    console.log('Database setup completed successfully!');
    
    // Create a demo admin user
    const hashedPassword = '$2b$10$1JqT7PgMqUHqvjm2GS3GlOBwtkFyF0RdaT9QlL.R9hOV.eIVACCKW'; // "password123"
    await pool.query(`
      INSERT INTO users (username, password, full_name, email, role) 
      VALUES ('admin', $1, 'Admin User', 'admin@impacttrack.org', 'admin')
      ON CONFLICT (username) DO NOTHING;
    `, [hashedPassword]);
    
    console.log('Demo admin user created (username: admin, password: password123)');
    
    // Create a demo organization
    await pool.query(`
      INSERT INTO organizations (name, industry, logo) 
      VALUES ('Impact Innovations', 'Non-profit', 'default_logo.png')
      ON CONFLICT DO NOTHING;
    `);
    
    console.log('Demo organization created');
    
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupDatabase().catch(console.error);
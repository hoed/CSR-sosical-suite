import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Execute setup_database.js to run the SQL schema
exec('node ' + join(__dirname, 'setup_database.js'), (error, stdout, stderr) => {
  if (error) {
    console.error(`Error executing setup_database.js: ${error}`);
    return;
  }
  
  console.log(stdout);
  
  if (stderr) {
    console.error(stderr);
  }
  
  console.log('Migration completed successfully!');
});
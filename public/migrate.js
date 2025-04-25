const { exec } = require('child_process');
const path = require('path');

// Execute setup_database.js to run the SQL schema
exec('node ' + path.join(__dirname, 'setup_database.js'), (error, stdout, stderr) => {
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
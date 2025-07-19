const { execSync } = require('child_process');
const fs = require('fs');

const executeCommand = (command) => {
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    process.exit(1);
  }
};

const main = async () => {
  console.log('Starting project setup...');

  // 1. Database connection string
  const dbUrl = "postgresql://Cockroach:vQIg23TGQnpGlohupuPalg@acorn-notes-13470.j77.aws-eu-central-1.cockroachlabs.cloud:26257/AcornNotes?sslmode=verify-full";

  // 2. Create new database names
  const dbName = `AcornNotes_${Date.now()}`;
  const shadowDbName = `${dbName}_shadow`;
  console.log(`Creating new database: ${dbName}`);
  console.log(`Creating new shadow database: ${shadowDbName}`);

  // 3. Update the .env file
  const envPath = '.env';
  let envContent = fs.readFileSync(envPath, 'utf-8');
  const dbUrlRegex = /DATABASE_URL=.*/;
  const shadowDbUrlRegex = /SHADOW_DATABASE_URL=.*/;
  const newDbUrl = dbUrl.replace(/\/[^/]+$/, `/${dbName}`);
  const newShadowDbUrl = dbUrl.replace(/\/[^/]+$/, `/${shadowDbName}`);

  if (envContent.match(dbUrlRegex)) {
    envContent = envContent.replace(dbUrlRegex, `DATABASE_URL="${newDbUrl}"`);
  } else {
    envContent += `\nDATABASE_URL="${newDbUrl}"`;
  }

  if (envContent.match(shadowDbUrlRegex)) {
    envContent = envContent.replace(shadowDbUrlRegex, `SHADOW_DATABASE_URL="${newShadowDbUrl}"`);
  } else {
    envContent += `\nSHADOW_DATABASE_URL="${newShadowDbUrl}"`;
  }

  fs.writeFileSync(envPath, envContent);
  console.log('.env file updated.');

  // 4. Create the new databases
  const sql = `CREATE DATABASE "${dbName}"; CREATE DATABASE "${shadowDbName}";`;
  const sqlFile = 'create_db.sql';
  fs.writeFileSync(sqlFile, sql);
  executeCommand(`npx prisma db execute --url "${dbUrl}" --file ${sqlFile}`);
  fs.unlinkSync(sqlFile);

  // 5. Run migrations
  console.log('Running database migrations...');
  executeCommand('npx prisma migrate dev --name init');

  console.log('Setup complete! You can now run `bun run dev` to start the application.');
};

main();
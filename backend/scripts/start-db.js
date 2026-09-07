const path = require('path');
const fs = require('fs');
const EmbeddedPostgres = require('embedded-postgres').default || require('embedded-postgres');

async function main() {
  const dataDir = path.resolve(__dirname, '../.pgdata');

  const pg = new EmbeddedPostgres({
    databaseDir: dataDir,
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    persistent: true,
    initdbFlags: ['-E', 'UTF8', '--locale=C'],
  });

  const isInitialized = fs.existsSync(path.join(dataDir, 'PG_VERSION'));

  if (!isInitialized) {
    console.log('📦 Initializing PostgreSQL cluster in UTF-8...');
    await pg.initialise();
  }

  console.log('🚀 Starting PostgreSQL on port 5432...');
  await pg.start();

  try {
    await pg.createDatabase('movieweb');
    console.log('✅ Database "movieweb" created successfully');
  } catch (err) {
    console.log('ℹ️ Database "movieweb" is ready');
  }

  console.log('🐘 PostgreSQL server running on localhost:5432 (user: postgres, db: movieweb, encoding: UTF8)');

  // Keep process alive
  setInterval(() => {}, 60000);
}

main().catch((err) => {
  console.error('Failed to run embedded postgres:', err);
  process.exit(1);
});

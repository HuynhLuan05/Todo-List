const { execSync } = require('child_process');
const path = require('path');

/**
 * Jest globalSetup: runs ONCE before all test suites in a separate process.
 * Creates/syncs the isolated test.db schema so the database file exists
 * before any test tries to connect to it.
 */
module.exports = async () => {
  execSync('npx prisma db push --skip-generate', {
    env: { ...process.env, DATABASE_URL: 'file:./prisma/test.db' },
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit',
  });
};

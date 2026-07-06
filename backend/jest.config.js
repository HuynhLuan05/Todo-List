module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  // Runs ONCE before all test suites: creates test.db schema via prisma db push
  globalSetup: '<rootDir>/tests/globalSetup.js',
  // Runs before each test file: overrides DATABASE_URL to point at test.db
  setupFiles: ['<rootDir>/tests/setup.js'],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};

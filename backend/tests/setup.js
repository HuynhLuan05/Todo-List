/**
 * Jest global setup: override DATABASE_URL to use an isolated test database
 * so that running tests never touches or corrupts the developer's dev.db file.
 */
process.env.DATABASE_URL = 'file:./prisma/test.db';

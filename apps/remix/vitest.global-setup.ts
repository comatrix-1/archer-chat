// vitest.global-setup.ts
import { execSync } from "node:child_process";
import { logger } from '@project/logging/src/index';

export default async function setup() {
  logger.info("Starting Vitest global setup");

  try {
    logger.info("Starting test database container...");
    execSync("docker-compose -f docker-compose.test.yml up -d postgres_test", {
      stdio: "inherit", // Show command output in the console
    });
    logger.info("Test database container started");

    logger.info("Resetting test database (prisma migrate reset)...");
    // Note: Your package.json had "prismamigrate", assuming it's "prisma migrate"
    // Using npx to ensure the prisma CLI from your devDependencies is used.
    // The NODE_ENV=test should be set by your main test script,
    // but we're being explicit here for clarity.
    execSync("npx prisma migrate reset --force", {
      stdio: "inherit",
    });
    logger.info("Test database reset and migrated");

    logger.info("Vitest global setup complete");
  } catch (error) {
    logger.fatal("Error during Vitest global setup", { error });
    if (error instanceof Error) {
      const errorInfo: Record<string, unknown> = { message: error.message };
      if ("stderr" in error && error.stderr) {
        errorInfo.stderr = error.stderr.toString();
      }
      if ("stdout" in error && error.stdout) {
        errorInfo.stdout = error.stdout.toString();
      }
      logger.error(`Error details: ${JSON.stringify(errorInfo)}`);
    }
    // Critical: Exit if setup fails to prevent tests from running in a bad state.
    process.exit(1);
  }
}

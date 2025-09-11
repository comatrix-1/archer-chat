// vitest.global-teardown.ts
import { execSync } from "node:child_process";
import { logger } from '@project/logging/src/index';

export default async function teardown() {
  logger.info("Starting Vitest global teardown");
  try {
    logger.info("Stopping test database container...");
    execSync(
      "docker-compose -f docker-compose.test.yml down -v --remove-orphans",
      {
        stdio: "inherit", // Show command output
      },
    );
    logger.info("Test database container stopped and cleaned up");
    logger.info("Vitest global teardown complete");
  } catch (error) {
    logger.error({ error }, "Error during Vitest global teardown");
    if (error instanceof Error) {
      const errorInfo: Record<string, unknown> = { message: error.message };
      if ("stderr" in error && error.stderr) {
        errorInfo.stderr = error.stderr.toString();
      }
      if ("stdout" in error && error.stdout) {
        errorInfo.stdout = error.stdout.toString();
      }
      logger.error(errorInfo, "Error details");
    }
    // You might choose to exit with an error code here as well,
    // though teardown failures are often less critical than setup failures.
    // process.exit(1);
  }
}

// vitest.global-setup.ts
import { execSync } from "child_process";

export default async function setup() {
	console.log("\n🚀 Starting Vitest global setup...");

	try {
		console.log("🐳 Starting test database container...");
		execSync("docker-compose -f docker-compose.test.yml up -d postgres_test", {
			stdio: "inherit", // Show command output in the console
		});
		console.log("✅ Test database container started.");

		console.log("🔄 Resetting test database (prisma migrate reset)...");
		// Note: Your package.json had "prismamigrate", assuming it's "prisma migrate"
		// Using npx to ensure the prisma CLI from your devDependencies is used.
		// The NODE_ENV=test should be set by your main test script,
		// ensuring Prisma targets the correct database if configured via environment variables.
		execSync("npx prisma migrate reset --force", {
			stdio: "inherit",
		});
		console.log("✅ Test database reset and migrated.");

		console.log("🎉 Vitest global setup complete.\n");
	} catch (error) {
		console.error("❌ Error during Vitest global setup:");
		if (error instanceof Error) {
			console.error(error.message);
			if ("stderr" in error && error.stderr) {
				console.error("Stderr:", error.stderr.toString());
			}
			if ("stdout" in error && error.stdout) {
				console.error("Stdout:", error.stdout.toString());
			}
		} else {
			console.error(error);
		}
		// Critical: Exit if setup fails to prevent tests from running in a bad state.
		process.exit(1);
	}
}

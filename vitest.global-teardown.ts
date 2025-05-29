// vitest.global-teardown.ts
import { execSync } from "child_process";

export default async function teardown() {
	console.log("\n🧹 Starting Vitest global teardown...");
	try {
		console.log("🐳 Stopping test database container...");
		execSync(
			"docker-compose -f docker-compose.test.yml down -v --remove-orphans",
			{
				stdio: "inherit", // Show command output
			},
		);
		console.log("✅ Test database container stopped and cleaned up.");
		console.log("🎉 Vitest global teardown complete.\n");
	} catch (error) {
		console.error("❌ Error during Vitest global teardown:");
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
		// You might choose to exit with an error code here as well,
		// though teardown failures are often less critical than setup failures.
		// process.exit(1);
	}
}

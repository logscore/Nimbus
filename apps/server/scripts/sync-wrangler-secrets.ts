import { execSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { parseArgs } from "node:util";
import { join } from "node:path";

// Supported environments
type Environment = "staging" | "production";

interface Secret {
	name: string;
	value: string;
}

// Parse command line arguments
const { values: args } = parseArgs({
	options: {
		env: {
			type: "string",
			short: "e",
			default: "staging",
		},
		help: {
			type: "boolean",
			short: "h",
			default: false,
		},
	},
});

// Help message
const printHelp = () => {
	console.log(`
  Usage: bun run sync-wrangler-secrets.ts [options]

  Options:
    -e, --env <environment>  Environment to sync secrets to (staging or production, default: staging)
    -h, --help               Show help
  `);
};

// Validate environment
const validateEnvironment = (env: string): env is Environment => {
	const validEnvs: Environment[] = ["staging", "production"];
	if (!validEnvs.includes(env as Environment)) {
		console.error(`Error: Invalid environment '${env}'. Must be one of: ${validEnvs.join(", ")}`);
		return false;
	}
	return true;
};

// Get environment file
const getEnvFile = (env: Environment): string => {
	return env === "production" ? ".dev.vars.production" : ".dev.vars.staging";
};

// Get Wrangler secrets
const getWranglerSecrets = async (env: Environment): Promise<Set<string>> => {
	try {
		const output = execSync(`bun run wrangler secret list --env ${env}`, { stdio: "pipe" });
		const secrets = JSON.parse(output.toString()) as Secret[];
		return new Set(secrets.map(secret => secret.name));
	} catch (error) {
		console.error("Error fetching Wrangler secrets:", error);
		return new Set();
	}
};

// Delete Wrangler secret
const deleteWranglerSecret = async (name: string, env: Environment): Promise<boolean> => {
	try {
		console.log(`Deleting secret: ${name}`);
		// There is no way to automatically delete by passing --yes|-y, so you have to do it manually
		// but this automates the process of deleting secrets that are no longer in the .dev.vars file
		execSync(`bun run wrangler secret delete ${name} --env ${env}`, { stdio: "inherit" });
		return true;
	} catch (error) {
		console.error(`Error deleting secret ${name}:`, error);
		return false;
	}
};

// Parse .dev.vars file
const parseDevVars = async (env: Environment): Promise<Record<string, string>> => {
	const envFile = getEnvFile(env);

	try {
		const content = await readFile(join(process.cwd(), envFile), "utf-8");

		return content
			.split("\n")
			.filter(line => line && !line.startsWith("#"))
			.reduce(
				(acc, line) => {
					const [key, ...value] = line.split("=");
					if (key && value.length > 0) {
						acc[key.trim()] = value
							.join("=")
							.trim()
							.replace(/(^['"]|['"]$)/g, "");
					}
					return acc;
				},
				{} as Record<string, string>
			);
	} catch (error) {
		console.error(`Error reading ${envFile}`, error);
		process.exit(1);
	}
};

// Main function
const main = async () => {
	if (args.help) {
		printHelp();
		return;
	}

	const env = args.env?.toLowerCase() as Environment;
	if (!validateEnvironment(env)) {
		process.exit(1);
	}

	console.log(`Syncing secrets for environment: ${env}\n`);

	// Get current Wrangler secrets
	console.log("Fetching existing Wrangler secrets...");
	const wranglerSecrets = await getWranglerSecrets(env);
	console.log(`Found ${wranglerSecrets.size} existing secrets\n`);

	// Parse local .dev.vars
	console.log("Reading local .dev.vars file...");
	const localSecrets = await parseDevVars(env);
	const localSecretKeys = new Set(Object.keys(localSecrets));
	console.log(`Found ${localSecretKeys.size} secrets in .dev.vars\n`);

	// Delete secrets that exist in Wrangler but not in local .dev.vars
	const secretsToDelete = [...wranglerSecrets].filter(secret => !localSecretKeys.has(secret));

	if (secretsToDelete.length > 0) {
		console.log(`Found ${secretsToDelete.length} secrets to delete:`);
		for (const secret of secretsToDelete) {
			await deleteWranglerSecret(secret, env);
		}
		console.log("");
	} else {
		console.log("No secrets to delete.\n");
	}

	// Create/update secrets from .dev.vars
	if (localSecretKeys.size > 0) {
		console.log("Updating secrets from .dev.vars...");

		try {
			// Use wrangler secret bulk with stdin to create/update all secrets
			execSync(`bun run wrangler secret bulk --env ${env}`, {
				input: JSON.stringify(localSecrets, null, 2),
				stdio: ["pipe", "inherit", "inherit"],
			});
			console.log("Secrets updated successfully!\n");
		} catch (error) {
			console.error("Error updating secrets:", error);
		}
	}

	// Verify the final state
	console.log("Verifying secrets...");
	const finalSecrets = await getWranglerSecrets(env);
	const missingSecrets = [...localSecretKeys].filter(key => !finalSecrets.has(key));

	if (missingSecrets.length > 0) {
		console.error("Error: The following secrets were not synced successfully:");
		missingSecrets.forEach(secret => console.error(`- ${secret}`));
		process.exit(1);
	} else {
		console.log("All secrets are in sync!");
		console.log(`\nTotal secrets in ${env}: ${finalSecrets.size}`);
	}
};

// Run the script
main().catch(console.error);

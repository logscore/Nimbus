// oxlint-disable no-await-in-loop
import { access, constants, copyFile, readFile } from "node:fs/promises";
import { getRootEnvFiles } from "./utils/glob-patterns";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { basename } from "node:path";
import { glob } from "glob";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

interface PackageJson {
	workspaces?: string[];
}

async function fileExists(path: string): Promise<boolean> {
	try {
		await access(path, constants.F_OK);
		return true;
	} catch {
		return false;
	}
}

async function main() {
	const args = process.argv.slice(2);
	const isDryRun = args.includes("--dry-run");

	console.log(`🚀 Starting to copy .env files${isDryRun ? " (dry run)" : ""}`);

	try {
		// Read package.json
		const packageJsonPath = join(rootDir, "package.json");
		const packageJson: PackageJson = JSON.parse(await readFile(packageJsonPath, "utf-8"));

		if (!packageJson.workspaces || packageJson.workspaces.length === 0) {
			console.log("No workspaces found in package.json");
			return;
		}

		console.log(`📦 Found workspaces: ${packageJson.workspaces.join(", ")}`);

		// Find all .env* files in root
		const envFiles = await getRootEnvFiles(rootDir);

		if (envFiles.length === 0) {
			console.log("No .env* files found in root directory");
			return;
		}

		console.log(`🔍 Found .env files: ${envFiles.map(f => basename(f)).join(", ")}`);

		// Process each workspace pattern
		for (const workspacePattern of packageJson.workspaces) {
			const workspaceDirs = (
				await glob(workspacePattern, {
					cwd: rootDir,
					withFileTypes: true,
					ignore: ["node_modules", "dist", "build", "coverage", "out"],
				})
			)
				.filter(dirent => dirent.isDirectory())
				.map(dirent => dirent.fullpath());

			for (const workspaceDir of workspaceDirs) {
				console.log(`📂 Processing workspace: ${workspaceDir.split("/").pop()}`);

				// Ensure workspace directory exists
				if (!(await fileExists(workspaceDir))) {
					console.log(`  ⚠️  Directory does not exist: ${workspaceDir}`);
					continue;
				}

				// Copy each .env* file to the workspace
				for (const envFile of envFiles) {
					const fileName = basename(envFile);
					const destPath = join(workspaceDir, fileName);

					if (isDryRun) {
						console.log(`  📄 [DRY RUN] Would copy ${fileName} to ${workspaceDir.split("/").pop()}/`);
					} else {
						try {
							await copyFile(envFile, destPath);
							console.log(`  ✅ Copied ${fileName} to ${workspaceDir.split("/").pop()}/`);
						} catch (error) {
							console.error(`  ❌ Error copying ${fileName}:`, error instanceof Error ? error.message : error);
						}
					}
				}
			}
		}

		console.log("✨ Done!");
	} catch (error) {
		console.error("❌ An error occurred:", error instanceof Error ? error.message : error);
		process.exit(1);
	}
}

void main();

// INFO: This file does not work as a .ts on Windows as of 2025-06-20

/**
 * @type {import('lint-staged').Configuration}
 */
const config = {
	// Lint and fix Next.js files
	"apps/web/**/*.{ts,tsx,js,jsx}": () => "bun run --cwd=apps/web lint --fix",

	// Lint and fix TypeScript and JavaScript files
	"**/*.{ts,tsx,js,jsx}": ["oxlint --fix", "prettier --write --list-different"],

	// Format JSON and YAML files
	"**/*.{json,md,yml,yaml}": ["prettier --write --list-different"],
};

export default config;

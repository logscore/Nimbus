import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";
import { config } from "dotenv";

// Load environment variables from .env file
config();

export default defineConfig({
	plugins: [tsconfigPaths()],
	test: {
		globals: true,
		setupFiles: ["./test-setup.ts"],
		sequence: {
			concurrent: true,
		},
		include: [
			"**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
			"**/tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
		],
		coverage: {
			provider: "v8",
			reporter: ["html", "json-summary", "lcov"],
			// Only include source files from current workspace
			include: ["**/src/**/*"],
			exclude: [
				"**/node_modules/**",
				"**/tests/**",
				"**/*.test.ts",
				"**/*.spec.ts",
				"**/dist/**",
				"**/build/**",
				"**/coverage/**",
				"**/*.d.ts",
				"**/*.config.*",
				"**/*.setup.*",
				"**/index.ts", // Often just re-exports
			],
			// TODO(tests): enable when we have better test coverage
			thresholds: {
				// statements: 80,
				// branches: 80,
				// functions: 80,
				// lines: 80,
			},
			reportsDirectory: "./coverage",
			// Clean coverage directory before each run
			clean: true,
		},
	},
});

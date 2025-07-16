import type { KnipConfig } from "knip";

const localAndScripts = ["*.{ts,js}", "scripts/**/*.{ts,js}"];
const indexEntry = "src/index.{ts,js}";
const project = "**/*.{ts,js}";

const ignoreUtils = ["src/utils/*"];
const ignoreHealthCheck = ["health-check.js"];
const ignoreLibraries = ["**/lib/google-drive/**", "**/lib/one-drive/**"];
const ignoreComponents = ["**/components/**"];

const ignoreBinaries = ["fly", "flyctl"];
const ignoreTsconfigDependencies = ["@nimbus/tsconfig"];

const config: KnipConfig = {
	workspaces: {
		".": {
			entry: localAndScripts,
			project: localAndScripts,
			ignoreDependencies: ignoreTsconfigDependencies,
		},

		"apps/server": {
			entry: indexEntry,
			project,
			ignore: [...ignoreHealthCheck, ...ignoreLibraries],
			ignoreBinaries,
		},

		// https://knip.dev/reference/plugins/next#_top
		"apps/web": {
			ignore: [...ignoreHealthCheck, ...ignoreComponents],
			ignoreBinaries,
			ignoreDependencies: ["tailwindcss", "tw-animate-css", "eslint", "eslint-config-next", "postcss"],
		},

		"packages/cache": {
			ignore: ignoreUtils,
			ignoreBinaries,
		},

		"packages/db": {
			ignore: ignoreUtils,
		},

		"packages/tsconfig": {
			entry: "base.json",
		},
	},
};

export default config;

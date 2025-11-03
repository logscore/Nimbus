import type { KnipConfig } from "knip";

const localAndScripts = ["*.{ts,js}", "scripts/**/*.{ts,js}"];
const indexEntry = "src/index.{ts,js}";
const project = "**/*.{ts,js}";

const ignoreUtils = ["src/utils/*"];
const ignoreComponents = ["**/components/**"];

const config: KnipConfig = {
	workspaces: {
		".": {
			entry: localAndScripts,
			project: localAndScripts,
		},

		"apps/server": {
			entry: indexEntry,
			project,
		},

		// https://knip.dev/reference/plugins/next#_top
		"apps/web": {
			ignore: ignoreComponents,
			ignoreDependencies: [
				"tailwindcss",
				"tw-animate-css",
				"postcss",
				"eslint",
				"eslint-config-next",
				"@t3-oss/env-core",
				"@radix-ui/*",
			],
		},

		"packages/cache": {
			ignore: ignoreUtils,
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

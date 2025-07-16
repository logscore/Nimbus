import { buildEslintConfig } from "@nimbus/eslint";

const eslintConfig = [
	...buildEslintConfig(),
	{
		ignores: [
			"apps/web/**",
			// Migrated from .eslintignore
			"**/server/lib/google-drive/**",
			"**/server/lib/one-drive/**",
			"**/node_modules/**",
			"**/.next/**",
			"**/dist/**",
			"**/build/**",
			"**/coverage/**",
			"**/out/**",
		],
	},
];

export default eslintConfig;

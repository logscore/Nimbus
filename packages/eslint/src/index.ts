import eslintUnusedImports from "eslint-plugin-unused-imports";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import eslintPluginSonarjs from "eslint-plugin-sonarjs";
import oxlintPlugin from "eslint-plugin-oxlint";
import tseslint from "typescript-eslint";
import eslint from "@eslint/js";

const tsconfigRootDir = process.cwd();

export function buildEslintConfig() {
	// Base configuration for all files
	const baseConfig = {
		ignores: ["**/node_modules", "**/.next", "**/dist", "**/build", "**/coverage", "**/out"],
	};

	// TypeScript specific configuration
	const typescriptConfig = tseslint.config(
		{
			files: ["**/*.ts", "**/*.tsx"],
			languageOptions: {
				parserOptions: {
					project: true, // Automatically find the nearest tsconfig.json
					tsconfigRootDir,
				},
			},
			rules: {
				"@typescript-eslint/no-floating-promises": "error",
			},
		},
		tseslint.configs.strict,
		tseslint.configs.stylistic
	);

	// JavaScript configuration
	const javascriptConfig = {
		files: ["**/*.js", "**/*.jsx"],
		extends: [eslint.configs.recommended],
	};

	// Common plugins and rules
	const commonConfig = {
		plugins: {
			sonarjs: eslintPluginSonarjs,
			unicorn: eslintPluginUnicorn,
			unusedImports: eslintUnusedImports,
		},
	};

	// Oxlint configuration
	const oxlintConfig = oxlintPlugin.configs["flat/all"];

	// Combine all configurations
	const eslintConfig = tseslint.config(baseConfig, commonConfig, typescriptConfig, javascriptConfig, oxlintConfig);

	return eslintConfig;
}

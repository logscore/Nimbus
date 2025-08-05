import { buildEslintConfig } from "@nimbus/eslint";
import { FlatCompat } from "@eslint/eslintrc";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
	baseDirectory: __dirname,
});

const baseConfig = buildEslintConfig();
const nextConfig = compat.extends("next/core-web-vitals", "next/typescript");

const eslintConfig = [...baseConfig, ...nextConfig];

export default eslintConfig;

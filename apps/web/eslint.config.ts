import { buildEslintConfig } from "@nimbus/eslint";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
	baseDirectory: import.meta.url,
});

const baseConfig = buildEslintConfig();
const nextConfig = compat.extends("next/core-web-vitals", "next/typescript");

const eslintConfig = [...baseConfig, ...nextConfig];

export default eslintConfig;

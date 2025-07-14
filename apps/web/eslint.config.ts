import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
	baseDirectory: import.meta.dirname,
});

// Use only Next.js config to avoid plugin conflicts
// The base config is already applied at the root level
const eslintConfig = [
	...compat.extends("next/core-web-vitals", "next/typescript"),
	{
		// Add any web-specific ignores here if needed
		ignores: ["node_modules/**", ".next/**", "dist/**", "build/**", "coverage/**", "out/**"],
	},
];

export default eslintConfig;

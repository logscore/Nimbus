import { buildEslintConfig } from "@nimbus/eslint";

const eslintConfig = [...buildEslintConfig(), { ignores: ["apps/web/**", "apps/server/.wrangler/**"] }];

export default eslintConfig;

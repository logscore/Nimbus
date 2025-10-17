import tanstackRouter from "@tanstack/router-plugin/vite";
import { devtools } from "@tanstack/devtools-vite";
import tsconfigPaths from "vite-tsconfig-paths";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
	plugins: [
		devtools({
			removeDevtoolsOnBuild: true,
			logging: true,
			enhancedLogs: {
				enabled: true,
			},
		}),
		tanstackRouter({
			target: "react",
			autoCodeSplitting: true,
			routesDirectory: "./src/routes",
			generatedRouteTree: "./src/routeTree.gen.ts",
			routeFileIgnorePrefix: "-",
			quoteStyle: "double",
		}),
		react(),
		tsconfigPaths(),
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
			"@/public": path.resolve(__dirname, "./public"),
		},
	},
	server: {
		port: 3000,
		host: true,
	},
	build: {
		outDir: "dist",
		sourcemap: true,
	},
	optimizeDeps: {
		exclude: ["@nimbus/auth", "@nimbus/env", "@nimbus/server", "@nimbus/shared"],
	},
	define: {
		"process.env": {},
	},
});

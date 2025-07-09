import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	reactStrictMode: true,
	// Only set output to 'standalone' in Node.js environment
	...(typeof process !== "undefined" &&
		process.env && {
			output: "standalone" as const,
		}),
};

export default nextConfig;

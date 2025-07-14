import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	reactStrictMode: true,
	output: "standalone",
	transpilePackages: ["@t3-oss/env-core"],
};

export default nextConfig;

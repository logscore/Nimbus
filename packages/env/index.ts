let env: CloudflareEnv | NodeJS.ProcessEnv = process.env;

try {
	// Check if we're in a Cloudflare Workers environment
	if (
		(globalThis as any).Cloudflare &&
		typeof process === "undefined" &&
		(globalThis as any).WebSocketPair !== undefined
	) {
		// This will only work at runtime in Cloudflare Workers
		const { env: CloudflareEnv } = await import("cloudflare:workers");
		env = CloudflareEnv;
	}
} catch (error) {
	// If cloudflare:workers import fails (e.g., during build), fall back to process.env
	throw new Error("Failed to load environment variables");
}

export default env;

let runtimeEnv: NodeJS.ProcessEnv = process.env;

let isEdge = false;

// Only try to initialize Cloudflare Workers env at runtime
async function initCloudflareEnv() {
	if (typeof process !== "undefined" && process.env.NODE_ENV === "development") {
		return;
	}

	try {
		// Check if we're in a Cloudflare Workers environment
		if ((globalThis as any).Cloudflare && (globalThis as any).WebSocketPair !== undefined) {
			// Use dynamic import to avoid webpack processing this import
			const { env } = await new Function('return import("cloudflare:workers")')();
			runtimeEnv = env as NodeJS.ProcessEnv;
			isEdge = true;
		}
	} catch (error) {
		console.warn("Falling back to process.env as Cloudflare Workers environment was not detected");
	}
}

await initCloudflareEnv().catch(console.error);

const BASE_ENV = {
	runtimeEnv,
	emptyStringAsUndefined: true,
} as const;

export { isEdge };
export default BASE_ENV;

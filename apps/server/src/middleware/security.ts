import type { SecurityOptions } from "@/routes/types";
import type { Context, Next } from "hono";
import { webcrypto } from "node:crypto";

/**
 * A utility function to safely get the client's IP address.
 * It parses the X-Forwarded-For header and trusts the leftmost IP,
 * which is standard when behind a properly configured reverse proxy.
 *
 * IMPORTANT: This relies on your reverse proxy (e.g., NGINX, Vercel, Cloudflare)
 * correctly setting or stripping the X-Forwarded-For header to prevent spoofing.
 */
const getClientIp = (c: Context): string => {
	const xff = c.req.header("x-forwarded-for");
	// If XFF exists, take the first IP in the list.
	if (xff) {
		return xff.split(",")[0].trim();
	}
	// Fallback to other common headers.
	const realIp = c.req.header("x-real-ip");
	if (realIp) {
		return realIp.trim();
	}

	return `unidentifiable-${webcrypto.randomUUID()}`;
};

export const securityMiddleware = (options: SecurityOptions = {}) => {
	const {
		rateLimiting = {
			enabled: options.rateLimiting?.enabled ?? true,
			rateLimiter: options.rateLimiting?.rateLimiter,
		},
		securityHeaders = options.securityHeaders ?? true,
	} = options;

	return async (c: Context, next: Next) => {
		// Headers
		if (securityHeaders) {
			const nonce = Buffer.from(webcrypto.getRandomValues(new Uint8Array(16)))
				.toString("base64")
				.replace(/\+/g, "-")
				.replace(/\//g, "_")
				.replace(/=/g, "");

			c.header("X-Content-Type-Options", "nosniff");
			c.header("X-Frame-Options", "DENY");
			c.header("Referrer-Policy", "strict-origin-when-cross-origin");
			c.header("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
			c.header("X-DNS-Prefetch-Control", "off");
			c.header("Cross-Origin-Embedder-Policy", "require-corp");
			c.header("Cross-Origin-Opener-Policy", "same-origin");
			c.header("Cross-Origin-Resource-Policy", "same-site");
			c.header("Origin-Agent-Cluster", "?1");
			c.header("X-Download-Options", "noopen");
			c.header(
				"Permissions-Policy",
				"camera=(), microphone=(), geolocation=(), " +
					"payment=(), fullscreen=(), accelerometer=(), " +
					"gyroscope=(), magnetometer=(), midi=(), " +
					"usb=(), xr-spatial-tracking=()"
			);
			c.header(
				"Content-Security-Policy",
				`default-src 'self'; ` +
					`script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https:; ` +
					// FIXED: CSP is now more restrictive. You MUST add your trusted sources.
					// Example: `style-src 'self' 'https://fonts.googleapis.com';`
					`style-src 'self'; ` +
					// Example: `img-src 'self' data: blob: https://cdn.example.com;`
					`img-src 'self' data: blob:; ` +
					// Example: `font-src 'self' https://fonts.gstatic.com;`
					`font-src 'self' data:; ` +
					// Example: `connect-src 'self' wss://api.example.com;`
					`connect-src 'self'; ` +
					`media-src 'self' data:; ` +
					`object-src 'none'; ` +
					`base-uri 'self'; ` +
					`form-action 'self'; ` +
					`frame-ancestors 'none'; ` +
					`upgrade-insecure-requests; ` +
					`block-all-mixed-content;`
			);
		}

		// Rate limiting
		if (rateLimiting.enabled && rateLimiting.rateLimiter) {
			const user = c.get("user");
			// FIXED: Use the safe IP retrieval function.
			const ip = getClientIp(c);
			const identifier = user?.id || ip;

			try {
				await rateLimiting.rateLimiter.consume(identifier);
			} catch (error: any) {
				// FIXED: More reliable error handling.
				// Checks for a property common to rate limit errors instead of `instanceof Error`.
				if (typeof error.msBeforeNext === "number") {
					// Rate limit exceeded
					const retryAfter = Math.ceil(error.msBeforeNext / 1000) || 1;
					c.header("Retry-After", retryAfter.toString());
					return c.json(
						{
							error: "Too many requests",
							retryAfter: `${retryAfter} seconds`,
						},
						{ status: 429 }
					);
				}

				// All other errors are treated as internal server errors.
				console.error("Rate limiter internal error:", error);
				return c.json({ error: "Internal server error" }, { status: 500 });
			}
		}

		await next();
	};
};

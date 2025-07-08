import type { RateLimiterRedis } from "rate-limiter-flexible";
import type { SecurityOptions } from "@/routes/types";
import type { Context, Next } from "hono";
import { webcrypto } from "node:crypto";

export function buildSecurityMiddleware(rateLimiter: RateLimiterRedis) {
	return securityMiddleware({
		rateLimiting: {
			enabled: true,
			rateLimiter,
		},
		securityHeaders: true,
	});
}

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
					`style-src 'self' https:; ` +
					`img-src 'self' data: blob: https:; ` +
					`font-src 'self' https: data:; ` +
					`connect-src 'self' https: wss:; ` +
					`media-src 'self' https: data:; ` +
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
			const ip = c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
			const identifier = user?.id || ip;

			try {
				await rateLimiting.rateLimiter.consume(identifier);
			} catch (error: any) {
				if (error instanceof Error) {
					console.error("Rate limiter error:", error);
					return c.json({ error: "Internal server error" }, { status: 500 });
				}

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
		}

		await next();
	};
};

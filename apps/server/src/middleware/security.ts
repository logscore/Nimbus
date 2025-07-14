import type { UserRateLimiter } from "@nimbus/cache/rate-limiters";
import type { RateLimiter } from "@nimbus/cache";
import type { Context, Next } from "hono";
import { webcrypto } from "node:crypto";

/**
 * Security middleware options
 */
export interface SecurityOptions {
	rateLimiting?: {
		enabled: boolean;
		rateLimiter: (c: Context) => RateLimiter;
	};
	securityHeaders?: boolean;
}

export function buildSecurityMiddleware(rateLimiter: UserRateLimiter) {
	return securityMiddleware({
		rateLimiting: {
			enabled: true,
			rateLimiter(c) {
				return rateLimiter(c.var.user);
			},
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
			const user = c.var.user;
			const getClientIP = () => {
				// Prioritize CF header for Cloudflare deployments
				const cfIP = c.req.header("cf-connecting-ip");
				if (cfIP) return cfIP;

				// Handle x-forwarded-for (may contain multiple IPs)
				const forwarded = c.req.header("x-forwarded-for");
				if (forwarded) {
					// Take the first IP from the list
					const firstIP = forwarded.split(",")[0]?.trim();
					return firstIP || "unknown";
				}

				return c.req.header("x-real-ip") || "unknown";
			};
			const ip = getClientIP();
			const identifier = user?.id || ip;

			try {
				const limiter = rateLimiting.rateLimiter(c);
				if ("limit" in limiter) {
					// Handle Upstash limit
					const result = await limiter.limit(identifier);
					if (!result.success) {
						const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);
						c.header("Retry-After", retryAfter.toString());
						return c.json(
							{
								success: false,
								error: "Too many requests",
								retryAfter: `${retryAfter} seconds`,
							},
							429
						);
					}
				} else {
					// Handle Valkey limit
					await limiter.consume(identifier);
				}
			} catch (error: any) {
				console.error("Rate limiter error:", error);

				// Handle different types of rate limit errors
				if (error.remaining === 0 || error.msBeforeNext) {
					// This is a rate limit exceeded error for Valkey
					const retryAfter = Math.ceil((error.msBeforeNext || 60000) / 1000);
					c.header("Retry-After", retryAfter.toString());
					return c.json(
						{
							success: false,
							error: "Too many requests. Please try again later.",
							retryAfter: `${retryAfter} seconds`,
						},
						429
					);
				}

				// Generic errors
				return c.json(
					{
						success: false,
						error: "An error occurred while processing your request.",
					},
					500
				);
			}
		}

		await next();
	};
};

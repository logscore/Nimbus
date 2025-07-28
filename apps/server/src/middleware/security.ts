import { createRateLimiter, type CreateRateLimiterContext } from "@nimbus/cache/rate-limiters";
import type { RateLimiter } from "@nimbus/cache";
import { sendError } from "../routes/utils";
import type { Context, Next } from "hono";
import { webcrypto } from "node:crypto";

/**
 * Security middleware options
 */
interface SecurityOptions {
	rateLimiting?: {
		enabled: boolean;
		rateLimiter: (c: Context) => RateLimiter;
	};
	securityHeaders?: boolean;
}

export function buildSecurityMiddleware(ctx: CreateRateLimiterContext) {
	return securityMiddleware({
		rateLimiting: {
			enabled: true,
			rateLimiter: c => createRateLimiter(ctx),
		},
		securityHeaders: true,
	});
}

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
	const firstIpAddress = xff?.split(",")[0];
	if (firstIpAddress) {
		return firstIpAddress.trim();
	}
	// Fallback to other common headers.
	const realIp = c.req.header("x-real-ip");
	if (realIp) {
		return realIp.trim();
	}

	return `unidentifiable-${webcrypto.randomUUID()}`;
};

const securityMiddleware = (options: SecurityOptions = {}) => {
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
			const user = c.var.user;
			const ip = getClientIp(c);
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

				return sendError(c);
			}
		}

		await next();
	};
};

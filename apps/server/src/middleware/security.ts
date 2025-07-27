import { waitlistRateLimiter, type UserRateLimiter } from "@nimbus/cache/rate-limiters";
import type { RateLimiter } from "@nimbus/cache";
import { sendError } from "../routes/utils";
import type { Context, Next } from "hono";
import { webcrypto } from "node:crypto";

/**
 * Security middleware options
 */
export interface SecurityOptions {
	rateLimiting?: {
		enabled: boolean;
		rateLimiter: (c: Context) => Promise<RateLimiter>;
	};
	securityHeaders?: boolean;
}

export function buildUserSecurityMiddleware(rateLimiter: UserRateLimiter) {
	return buildSecurityMiddleware(async c => await rateLimiter(c.var.user));
}

export function buildWaitlistSecurityMiddleware() {
	return buildSecurityMiddleware(
		async c =>
			await waitlistRateLimiter(
				c.req.header("cf-connecting-ip") || c.req.header("x-real-ip") || c.req.header("x-forwarded-for") || "unknown"
			)
	);
}

function buildSecurityMiddleware(rateLimiter: (c: Context) => Promise<RateLimiter>) {
	return securityMiddleware({
		rateLimiting: {
			enabled: true,
			rateLimiter,
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
	const firstIpAddress = xff?.split(",")[0];
	if (firstIpAddress) return firstIpAddress.trim();

	const realIp = c.req.header("x-real-ip");
	if (realIp) return realIp.trim();

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
					`style-src 'self'; ` +
					`img-src 'self' data: blob:; ` +
					`font-src 'self' data:; ` +
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
				const limiter = await rateLimiting.rateLimiter(c);

				if ("limit" in limiter) {
					// Handle Upstash
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
					// Handle Valkey
					await limiter.consume(identifier);
				}
			} catch (error: any) {
				console.error("Rate limiter error:", error);

				if (error.remaining === 0 || error.msBeforeNext) {
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

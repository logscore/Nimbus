import { RateLimiterRes, type RateLimiterAbstract } from "rate-limiter-flexible";
import type { Context, Next } from "hono";

function getIp(c: Context) {
	const key =
		c.req.header("x-forwarded-for") ||
		c.req.raw.headers.get("cf-connecting-ip") ||
		c.req.raw.headers.get("x-real-ip") ||
		"anonymous";
	return key;
}

function setRateLimitHeaders(c: Context, rateLimiterRes: RateLimiterRes, limiter: RateLimiterAbstract) {
	const limit = limiter.points.toString();
	const remaining = rateLimiterRes.remainingPoints.toString();
	const reset = Math.ceil((Date.now() + rateLimiterRes.msBeforeNext) / 1000).toString();
	const consume = (limiter.points - rateLimiterRes.remainingPoints).toString();

	c.res.headers.set("X-RateLimit-Limit", limit);
	c.res.headers.set("X-RateLimit-Remaining", remaining);
	c.res.headers.set("X-RateLimit-Reset", reset);
	c.res.headers.set("X-ratelimit-used", consume);
}

export function createRateLimiterMiddleware({ limiter }: { limiter: RateLimiterAbstract }) {
	return async (c: Context, next: Next) => {
		const key = getIp(c);
		try {
			const rateLimiterRes = await limiter.consume(key);
			setRateLimitHeaders(c, rateLimiterRes, limiter);
			return next();
		} catch (err) {
			if (err instanceof RateLimiterRes) {
				setRateLimitHeaders(c, err, limiter);
				return c.json(
					{
						success: false,
						error: "Too many requests. Please wait before trying again.",
					},
					429
				);
			}
			console.error("Error in rate limiter middleware:", err);
			return c.json({ success: false, error: "Internal server error" }, 500);
		}
	};
}

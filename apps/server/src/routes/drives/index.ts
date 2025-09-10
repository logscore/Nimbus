import { createPinnedFileSchema, deletePinnedFileSchema } from "@nimbus/shared";
import { sendError, sendSuccess, sendUnauthorized } from "../utils";
import { createRateLimiter } from "@nimbus/cache/rate-limiters";
import { securityMiddleware } from "../../middleware";
import { zValidator } from "@hono/zod-validator";
import { pinnedFile } from "@nimbus/db/schema";
import { type HonoContext } from "../../hono";
import { cacheClient } from "@nimbus/cache";
import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { Hono } from "hono";

// TODO(rate-limiting): implement for pinned files

const drivesRouter = new Hono<HonoContext>()
	.get(
		"/about",
		securityMiddleware({
			securityHeaders: true,
			rateLimiting: {
				enabled: true,
				rateLimiter: () =>
					createRateLimiter(cacheClient, {
						points: 100,
						duration: 60 * 1000,
						blockDuration: 60 * 1000,
						keyPrefix: `get-drive-info-`,
					}),
			},
		}),
		async c => {
			try {
				const drive = c.var.provider;
				const data = await drive.getDriveInfo();

				if (!data) {
					return sendError(c, { message: "Drive data not found", status: 404 });
				}

				return sendSuccess(c, { data });
			} catch (error) {
				console.error("Error fetching drive info:", error);
				return sendError(c);
			}
		}
	)

	.get(
		"/pinned",
		securityMiddleware({
			securityHeaders: true,
			rateLimiting: {
				enabled: true,
				rateLimiter: () =>
					createRateLimiter(cacheClient, {
						points: 100,
						duration: 60 * 1000,
						blockDuration: 60 * 1000,
						keyPrefix: `get-pinned-`,
					}),
			},
		}),
		async c => {
			const user = c.var.user;
			if (!user) {
				return sendUnauthorized(c, "Unauthorized");
			}
			const files = await c.var.db.query.pinnedFile.findMany({ where: (table, { eq }) => eq(table.userId, user.id) });
			return sendSuccess(c, { data: files });
		}
	)

	.post(
		"/pinned",
		zValidator("query", createPinnedFileSchema),
		securityMiddleware({
			securityHeaders: true,
			rateLimiting: {
				enabled: true,
				rateLimiter: () =>
					createRateLimiter(cacheClient, {
						points: 100,
						duration: 60 * 1000,
						blockDuration: 60 * 1000,
						keyPrefix: `add-pinned-`,
					}),
			},
		}),
		async c => {
			try {
				const user = c.var.user;
				if (!user) {
					return sendUnauthorized(c, "Unauthorized");
				}
				const fileId = c.req.valid("query").fileId;
				const name = c.req.valid("query").name;
				const type = c.req.valid("query").type;
				const mimeType = c.req.valid("query").mimeType;
				const provider = c.req.valid("query").provider;
				const accountId = c.req.valid("query").accountId;

				// Check if file is already pinned for this account
				const firstResult = await c.var.db.query.pinnedFile.findFirst({
					where: (table, { eq }) => eq(table.userId, user.id),
				});

				if (firstResult) {
					return sendError(c, {
						message: "File already pinned",
						status: 409,
					});
				}

				// Insert new pinned file
				const id = nanoid();
				await c.var.db.insert(pinnedFile).values({
					id,
					userId: user.id,
					fileId,
					name,
					type: type || "file",
					mimeType: mimeType || null,
					provider,
					accountId,
				});

				// Return success with the new pinned file ID
				return sendSuccess(c, {
					data: {
						id,
						success: true,
						message: "File pinned successfully",
					},
				});
			} catch (error) {
				console.error("Error pinning file:", error);
				return sendError(c, {
					message: "Failed to pin file",
					status: 500,
				});
			}
		}
	)

	.delete(
		"/pinned/:id",
		zValidator("param", deletePinnedFileSchema),
		securityMiddleware({
			securityHeaders: true,
			rateLimiting: {
				enabled: true,
				rateLimiter: () =>
					createRateLimiter(cacheClient, {
						points: 100,
						duration: 60 * 1000,
						blockDuration: 60 * 1000,
						keyPrefix: `remove-pinned-`,
					}),
			},
		}),
		async c => {
			const user = c.var.user;
			if (!user) {
				return sendUnauthorized(c, "Unauthorized");
			}
			const id = c.req.valid("param").id;

			await c.var.db.delete(pinnedFile).where(and(eq(pinnedFile.id, id), eq(pinnedFile.userId, user.id)));

			return sendSuccess(c, {
				data: {
					id,
					success: true,
					message: "File unpinned successfully",
				},
			});
		}
	);

export default drivesRouter;

import { createDriveProviderRouter } from "../../hono";
import { sendError, sendSuccess } from "../utils";
import { pinnedFile } from "@nimbus/db/schema";
import { eq, and } from "drizzle-orm";
import type { Context } from "hono";

const drivesRouter = createDriveProviderRouter()
	.get("/about", async (c: Context) => {
		try {
			const drive = c.get("provider");
			const data = await drive.getDriveInfo();

			if (!data) {
				return sendError(c, { message: "Drive data not found", status: 404 });
			}

			return sendSuccess(c, { data });
		} catch (error) {
			console.error("Error fetching drive info:", error);
			return sendError(c);
		}
	})
	.get("/pinned", async c => {
		const user = c.var.user;
		if (!user) {
			return sendError(c, { message: "User not authenticated", status: 401 });
		}

		const files = await c.var.db
			.select()
			.from(pinnedFile)
			.where(eq(pinnedFile.userId, (user as { id: string }).id));

		return sendSuccess(c, { data: files });
	})
	.post("/pinned", async (c: Context) => {
		try {
			const user = c.var.user;
			const accountId = c.req.header("X-Account-Id");

			if (!user) {
				return sendError(c, { message: "User not authenticated", status: 401 });
			}

			if (!accountId) {
				return sendError(c, { message: "Account ID is required", status: 400 });
			}

			const fileId = c.req.query("fileId");
			const name = c.req.query("name");
			const type = c.req.query("type");
			const mimeType = c.req.query("mimeType");
			const provider = c.req.query("provider");

			// Validate required fields
			if (!fileId || !name || !provider) {
				return sendError(c, {
					message: "Missing required fields: fileId, name, and provider are required",
					status: 400,
				});
			}

			// Check if file is already pinned for this account
			const existing = await c.var.db
				.select()
				.from(pinnedFile)
				.where(
					and(
						eq(pinnedFile.userId, (user as { id: string }).id),
						eq(pinnedFile.fileId, fileId),
						eq(pinnedFile.accountId, accountId)
					)
				);

			if (existing.length > 0) {
				return sendError(c, {
					message: "File already pinned",
					status: 409,
				});
			}

			// Insert new pinned file
			const id = crypto.randomUUID();
			await c.var.db.insert(pinnedFile).values({
				id,
				userId: user.id,
				accountId,
				fileId,
				name,
				type: type || "file",
				mimeType: mimeType || null,
				provider,
				createdAt: new Date(),
				updatedAt: new Date(),
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
	})
	.delete("/pinned/:id", async (c: Context) => {
		const user = c.var.user;
		const accountId = c.req.header("X-Account-Id");

		if (!user) {
			return sendError(c, { message: "User not authenticated", status: 401 });
		}

		if (!accountId) {
			return sendError(c, { message: "Account ID is required", status: 400 });
		}

		const id = c.req.param("id");
		if (!id) {
			return sendError(c, { message: "Missing pinned file id", status: 400 });
		}

		const result = await c.var.db
			.delete(pinnedFile)
			.where(and(eq(pinnedFile.id, id), eq(pinnedFile.userId, (user as { id: string }).id)));

		if (result.rowCount === 0) {
			return sendError(c, { message: "Pinned file not found", status: 404 });
		}

		return sendSuccess(c, {
			data: {
				id,
				success: true,
				message: "File unpinned successfully",
			},
		});
	});

export default drivesRouter;

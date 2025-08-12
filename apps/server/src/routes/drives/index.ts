import { createPinnedFileSchema, deletePinnedFileSchema } from "@nimbus/shared";
import { createDriveProviderRouter } from "../../hono";
import { sendError, sendSuccess } from "../utils";
import { zValidator } from "@hono/zod-validator";
import { pinnedFile } from "@nimbus/db/schema";
import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";

// TODO(rate-limiting): implement for pinned files

const drivesRouter = createDriveProviderRouter()
	.get("/about", async c => {
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
	})

	.get("/pinned", async c => {
		const user = c.var.user;
		const files = await c.var.db.query.pinnedFile.findMany({ where: (table, { eq }) => eq(table.userId, user.id) });
		return sendSuccess(c, { data: files });
	})

	.post("/pinned", zValidator("query", createPinnedFileSchema), async c => {
		try {
			const user = c.var.user;
			const fileId = c.req.valid("query").fileId;
			const name = c.req.valid("query").name;
			const type = c.req.valid("query").type;
			const mimeType = c.req.valid("query").mimeType;
			const provider = c.req.valid("query").provider;
			const accountId = c.req.valid("query").accountId;

			// Check if file is already pinned for this account
			const firstResult = await c.var.db.query.pinnedFile.findFirst({
				where: (table, { eq }) => eq(table.fileId, fileId),
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
	})

	.delete("/pinned/:id", zValidator("param", deletePinnedFileSchema), async c => {
		const user = c.var.user;
		const id = c.req.valid("param").id;

		await c.var.db.delete(pinnedFile).where(and(eq(pinnedFile.id, id), eq(pinnedFile.userId, user.id)));

		return sendSuccess(c, {
			data: {
				id,
				success: true,
				message: "File unpinned successfully",
			},
		});
	});

export default drivesRouter;

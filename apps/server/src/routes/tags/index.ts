import {
	addTagsToFileJsonSchema,
	addTagsToFileParamSchema,
	createTagSchema,
	deleteTagSchema,
	getFileByIdParamSchema,
	getTagByIdSchema,
	removeTagsFromFileJsonSchema,
	removeTagsFromFileParamSchema,
	updateTagJsonSchema,
	updateTagParamSchema,
} from "@nimbus/shared";
import { fileGetRateLimiter } from "@nimbus/cache/rate-limiters";
import { buildUserSecurityMiddleware } from "../../middleware";
import { createProtectedRouter } from "../../hono";
import { sendError, sendSuccess } from "../utils";
import { zValidator } from "@hono/zod-validator";
import { TagService } from "./tag-service";

const tagService = new TagService();

const tagsRouter = createProtectedRouter()
	// Get all tags for the authenticated user
	.get("/", async c => {
		const user = c.var.user;
		try {
			const tags = await tagService.getUserTags(user.id);
			return sendSuccess(c, { data: tags });
		} catch (error) {
			if (error instanceof Error) {
				return sendError(c, error);
			}
		}
	})

	// Get a specific tag by tag id (and the authenticated user id)
	.get("/:id", buildUserSecurityMiddleware(fileGetRateLimiter), zValidator("param", getTagByIdSchema), async c => {
		const user = c.var.user;
		const paramData = c.req.valid("param");
		try {
			const tag = await tagService.getTagById(paramData.id, user.id);
			if (!tag) {
				return sendError(c, { message: "Tag not found", status: 404 });
			}
			return sendSuccess(c, { data: tag });
		} catch (error) {
			if (error instanceof Error) {
				return sendError(c, error);
			}
		}
	})

	// Create a new tag
	.post("/", buildUserSecurityMiddleware(fileGetRateLimiter), zValidator("json", createTagSchema), async c => {
		const user = c.var.user;
		const data = c.req.valid("json");
		try {
			const newTag = await tagService.createTag(user.id, data.name, data.color, data.parentId);
			return sendSuccess(c, { data: newTag });
		} catch (error) {
			if (error instanceof Error) {
				return sendError(c, error);
			}
		}
	})

	// Update an existing tag
	.put(
		"/:id",
		buildUserSecurityMiddleware(fileGetRateLimiter),
		zValidator("param", updateTagParamSchema),
		zValidator("json", updateTagJsonSchema),
		async c => {
			const user = c.var.user;
			const paramData = c.req.valid("param");
			const bodyData = c.req.valid("json");
			try {
				const updatedTag = await tagService.updateTag(paramData.id, user.id, bodyData);
				return sendSuccess(c, { data: updatedTag });
			} catch (error) {
				if (error instanceof Error) {
					return sendError(c, error);
				}
			}
		}
	)

	// Delete a tag
	.delete("/:id", buildUserSecurityMiddleware(fileGetRateLimiter), zValidator("param", deleteTagSchema), async c => {
		const user = c.var.user;
		const paramData = c.req.valid("param");
		try {
			await tagService.deleteTag(paramData.id, user.id);
			return sendSuccess(c, { message: "Tag deleted successfully", status: 200 });
		} catch (error) {
			if (error instanceof Error) {
				return sendError(c, error);
			}
		}
	})

	// Add tags to a file
	.post(
		"/files/:fileId",
		buildUserSecurityMiddleware(fileGetRateLimiter),
		zValidator("param", addTagsToFileParamSchema),
		zValidator("json", addTagsToFileJsonSchema),
		async c => {
			const user = c.var.user;
			const fileId = c.req.valid("param").fileId;
			const tagIds = c.req.valid("json").tagIds;
			try {
				const fileTags = await tagService.addTagsToFile(fileId, tagIds, user.id);
				return sendSuccess(c, { data: fileTags });
			} catch (error) {
				if (error instanceof Error) {
					return sendError(c, error);
				}
			}
		}
	)

	// Remove tags from a file
	.delete(
		"/files/:fileId",
		buildUserSecurityMiddleware(fileGetRateLimiter),
		zValidator("param", removeTagsFromFileParamSchema),
		zValidator("json", removeTagsFromFileJsonSchema),
		async c => {
			const user = c.var.user;
			const fileId = c.req.valid("param").fileId;
			const tagIds = c.req.valid("json").tagIds;
			try {
				await tagService.removeTagsFromFile(fileId, tagIds, user.id);
				return sendSuccess(c, { message: "Tags removed from file successfully", status: 200 });
			} catch (error) {
				if (error instanceof Error) {
					return sendError(c, error);
				}
			}
		}
	)

	// Get all tags for a specific file
	.get(
		"/files/:fileId",
		buildUserSecurityMiddleware(fileGetRateLimiter),
		zValidator("param", getFileByIdParamSchema),
		async c => {
			const user = c.var.user;
			const fileId = c.req.valid("param").fileId;
			try {
				const tags = await tagService.getFileTags(fileId, user.id);
				return sendSuccess(c, { data: tags });
			} catch (error) {
				if (error instanceof Error) {
					return sendError(c, error);
				}
			}
		}
	);

export default tagsRouter;

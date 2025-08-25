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
import { sendError, sendSuccess, sendUnauthorized } from "../utils";
import { createRateLimiter } from "@nimbus/cache/rate-limiters";
import { securityMiddleware } from "../../middleware";
import { zValidator } from "@hono/zod-validator";
import { type HonoContext } from "../../hono";
import { cacheClient } from "@nimbus/cache";
import { TagService } from "./tag-service";
import { Hono } from "hono";

// TODO(rate-limiting): implement for tags

const tagService = new TagService();
const tagsRouter = new Hono<{ Variables: HonoContext }>()
	// Get all tags for the authenticated user
	.get(
		"/",
		securityMiddleware({
			securityHeaders: true,
			rateLimiting: {
				enabled: true,
				rateLimiter: () =>
					createRateLimiter(cacheClient, {
						points: 100,
						duration: 60 * 1000,
						blockDuration: 60 * 1000,
						keyPrefix: `get-tags-`,
					}),
			},
		}),
		async c => {
			const user = c.var.user;
			if (!user) {
				return sendUnauthorized(c, "Unauthorized");
			}
			const tags = await tagService.getUserTags(user.id);
			return sendSuccess(c, { data: tags });
		}
	)

	// Get a specific tag by tag id (and the authenticated user id)
	.get(
		"/:id",
		zValidator("param", getTagByIdSchema),
		securityMiddleware({
			securityHeaders: true,
			rateLimiting: {
				enabled: true,
				rateLimiter: () =>
					createRateLimiter(cacheClient, {
						points: 100,
						duration: 60 * 1000,
						blockDuration: 60 * 1000,
						keyPrefix: `get-tag-`,
					}),
			},
		}),
		async c => {
			const user = c.var.user;
			if (!user) {
				return sendUnauthorized(c, "Unauthorized");
			}
			const paramData = c.req.valid("param");
			const tag = await tagService.getTagById(paramData.id, user.id);
			if (!tag) {
				return sendError(c, { message: "Tag not found", status: 404 });
			}
			return sendSuccess(c, { data: tag });
		}
	)

	// Create a new tag
	.post(
		"/",
		zValidator("json", createTagSchema),
		securityMiddleware({
			securityHeaders: true,
			rateLimiting: {
				enabled: true,
				rateLimiter: () =>
					createRateLimiter(cacheClient, {
						points: 100,
						duration: 60 * 1000,
						blockDuration: 60 * 1000,
						keyPrefix: `post-tag-`,
					}),
			},
		}),
		async c => {
			const user = c.var.user;
			if (!user) {
				return sendUnauthorized(c, "Unauthorized");
			}
			const data = c.req.valid("json");
			const newTag = await tagService.createTag(user.id, data.name, data.color, data.parentId);
			return sendSuccess(c, { data: newTag });
		}
	)

	// Update an existing tag
	.put(
		"/:id",
		zValidator("param", updateTagParamSchema),
		zValidator("json", updateTagJsonSchema),
		securityMiddleware({
			securityHeaders: true,
			rateLimiting: {
				enabled: true,
				rateLimiter: () =>
					createRateLimiter(cacheClient, {
						points: 100,
						duration: 60 * 1000,
						blockDuration: 60 * 1000,
						keyPrefix: `put-tag-`,
					}),
			},
		}),
		async c => {
			const user = c.var.user;
			if (!user) {
				return sendUnauthorized(c, "Unauthorized");
			}
			const paramData = c.req.valid("param");
			const bodyData = c.req.valid("json");
			const updatedTag = await tagService.updateTag(paramData.id, user.id, bodyData);
			return sendSuccess(c, { data: updatedTag });
		}
	)

	// Delete a tag
	.delete(
		"/:id",
		zValidator("param", deleteTagSchema),
		securityMiddleware({
			securityHeaders: true,
			rateLimiting: {
				enabled: true,
				rateLimiter: () =>
					createRateLimiter(cacheClient, {
						points: 100,
						duration: 60 * 1000,
						blockDuration: 60 * 1000,
						keyPrefix: `delete-tag-`,
					}),
			},
		}),
		async c => {
			const user = c.var.user;
			if (!user) {
				return sendUnauthorized(c, "Unauthorized");
			}
			const paramData = c.req.valid("param");
			await tagService.deleteTag(paramData.id, user.id);
			return sendSuccess(c, { message: "Tag deleted successfully" });
		}
	)

	// Add tags to a file
	.post(
		"/files/:fileId",
		zValidator("param", addTagsToFileParamSchema),
		zValidator("json", addTagsToFileJsonSchema),
		securityMiddleware({
			securityHeaders: true,
			rateLimiting: {
				enabled: true,
				rateLimiter: () =>
					createRateLimiter(cacheClient, {
						points: 100,
						duration: 60 * 1000,
						blockDuration: 60 * 1000,
						keyPrefix: `add-file-tag-`,
					}),
			},
		}),
		async c => {
			const user = c.var.user;
			if (!user) {
				return sendUnauthorized(c, "Unauthorized");
			}
			const fileId = c.req.valid("param").fileId;
			const tagIds = c.req.valid("json").tagIds;
			const fileTags = await tagService.addTagsToFile(fileId, tagIds, user.id);
			return sendSuccess(c, { data: fileTags });
		}
	)

	// Remove tags from a file
	.delete(
		"/files/:fileId",
		zValidator("param", removeTagsFromFileParamSchema),
		zValidator("json", removeTagsFromFileJsonSchema),
		securityMiddleware({
			securityHeaders: true,
			rateLimiting: {
				enabled: true,
				rateLimiter: () =>
					createRateLimiter(cacheClient, {
						points: 100,
						duration: 60 * 1000,
						blockDuration: 60 * 1000,
						keyPrefix: `delete-file-tag-`,
					}),
			},
		}),
		async c => {
			const user = c.var.user;
			if (!user) {
				return sendUnauthorized(c, "Unauthorized");
			}
			const fileId = c.req.valid("param").fileId;
			const tagIds = c.req.valid("json").tagIds;
			await tagService.removeTagsFromFile(fileId, tagIds, user.id);
			return sendSuccess(c, { message: "Tags removed from file successfully" });
		}
	)

	// Get all tags for a specific file
	.get(
		"/files/:fileId",
		zValidator("param", getFileByIdParamSchema),
		securityMiddleware({
			securityHeaders: true,
			rateLimiting: {
				enabled: true,
				rateLimiter: () =>
					createRateLimiter(cacheClient, {
						points: 100,
						duration: 60 * 1000,
						blockDuration: 60 * 1000,
						keyPrefix: `get-file-tags-`,
					}),
			},
		}),
		async c => {
			const user = c.var.user;
			if (!user) {
				return sendUnauthorized(c, "Unauthorized");
			}
			const fileId = c.req.valid("param").fileId;
			const tags = await tagService.getFileTags(fileId, user.id);
			return sendSuccess(c, { data: tags });
		}
	);

export default tagsRouter;

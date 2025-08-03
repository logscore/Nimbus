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
import { createDriveProviderRouter } from "../../hono";
import { sendError, sendSuccess } from "../utils";
import { zValidator } from "@hono/zod-validator";
import { TagService } from "./tag-service";

// TODO(rate-limiting): implement for tags

const tagService = new TagService();
const tagsRouter = createDriveProviderRouter()
	// Get all tags for the authenticated user
	.get("/", async c => {
		const user = c.var.user;
		const tags = await tagService.getUserTags(user.id);
		return sendSuccess(c, { data: tags });
	})

	// Get a specific tag by tag id (and the authenticated user id)
	.get("/:id", zValidator("param", getTagByIdSchema), async c => {
		const user = c.var.user;
		const paramData = c.req.valid("param");
		const tag = await tagService.getTagById(paramData.id, user.id);
		if (!tag) {
			return sendError(c, { message: "Tag not found", status: 404 });
		}
		return sendSuccess(c, { data: tag });
	})

	// Create a new tag
	.post("/", zValidator("json", createTagSchema), async c => {
		const user = c.var.user;
		const data = c.req.valid("json");
		const newTag = await tagService.createTag(user.id, data.name, data.color, data.parentId);
		return sendSuccess(c, { data: newTag });
	})

	// Update an existing tag
	.put("/:id", zValidator("param", updateTagParamSchema), zValidator("json", updateTagJsonSchema), async c => {
		const user = c.var.user;
		const paramData = c.req.valid("param");
		const bodyData = c.req.valid("json");
		const updatedTag = await tagService.updateTag(paramData.id, user.id, bodyData);
		return sendSuccess(c, { data: updatedTag });
	})

	// Delete a tag
	.delete("/:id", zValidator("param", deleteTagSchema), async c => {
		const user = c.var.user;
		const paramData = c.req.valid("param");
		await tagService.deleteTag(paramData.id, user.id);
		return sendSuccess(c, { message: "Tag deleted successfully" });
	})

	// Add tags to a file
	.post(
		"/files/:fileId",
		zValidator("param", addTagsToFileParamSchema),
		zValidator("json", addTagsToFileJsonSchema),
		async c => {
			const user = c.var.user;
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
		async c => {
			const user = c.var.user;
			const fileId = c.req.valid("param").fileId;
			const tagIds = c.req.valid("json").tagIds;
			await tagService.removeTagsFromFile(fileId, tagIds, user.id);
			return sendSuccess(c, { message: "Tags removed from file successfully" });
		}
	)

	// Get all tags for a specific file
	.get("/files/:fileId", zValidator("param", getFileByIdParamSchema), async c => {
		const user = c.var.user;
		const fileId = c.req.valid("param").fileId;
		const tags = await tagService.getFileTags(fileId, user.id);
		return sendSuccess(c, { data: tags });
	});

export default tagsRouter;

import {
	addTagsToFileSchema,
	createTagSchema,
	deleteTagSchema,
	getTagByIdSchema,
	removeTagsFromFileSchema,
	updateTagSchema,
} from "@nimbus/shared";
import { sendError, sendSuccess } from "@/routes/utils";
import { TagService } from "@/routes/tags/tag-service";
import { createProtectedRouter } from "@/hono";

const tagsRouter = createProtectedRouter();
const tagService = new TagService();

// Get all tags for the authenticated user
tagsRouter.get("/", async c => {
	const user = c.var.user;

	try {
		const tags = await tagService.getUserTags(user.id);
		return sendSuccess(c, { data: tags });
	} catch (error) {
		if (error instanceof Error) {
			return sendError(c, error);
		}
	}
});

// Get a specific tag by tag id (and the authenticated user id)
tagsRouter.get("/:id", async c => {
	const user = c.var.user;

	// Validation
	const { error, data } = getTagByIdSchema.safeParse(c.req.param());
	if (error) {
		return sendError(c, error);
	}

	try {
		const tag = await tagService.getTagById(data.id, user.id);
		if (!tag) {
			return sendError(c, { message: "Tag not found", status: 404 });
		}
		return sendSuccess(c, { data: tag });
	} catch (error) {
		if (error instanceof Error) {
			return sendError(c, error);
		}
	}
});

// Create a new tag
tagsRouter.post("/", async c => {
	const user = c.var.user;

	try {
		// Validation
		const { error, data } = createTagSchema.safeParse(await c.req.json());
		if (error) {
			return sendError(c, error);
		}

		// Create tag
		const newTag = await tagService.createTag(user.id, data.name, data.color, data.parentId);
		return sendSuccess(c, { data: newTag });
	} catch (error) {
		if (error instanceof Error) {
			return sendError(c, error);
		}
	}
});

// Update an existing tag
tagsRouter.put("/:id", async c => {
	const user = c.var.user;

	// Validation
	const { error: paramError, data: paramData } = getTagByIdSchema.safeParse(c.req.param());
	if (paramError) {
		return sendError(c, paramError);
	}

	try {
		const { error: bodyError, data: bodyData } = updateTagSchema.safeParse(await c.req.json());
		if (bodyError) {
			return sendError(c, bodyError);
		}
		const updatedTag = await tagService.updateTag(paramData.id, user.id, bodyData);
		return sendSuccess(c, { data: updatedTag });
	} catch (error) {
		if (error instanceof Error) {
			return sendError(c, error);
		}
	}
});

// Delete a tag
tagsRouter.delete("/:id", async c => {
	const user = c.var.user;

	// Validation
	const { error, data } = deleteTagSchema.safeParse(c.req.param());
	if (error) {
		return sendError(c, error);
	}

	try {
		await tagService.deleteTag(data.id, user.id);
		return sendSuccess(c, { message: "Tag deleted successfully", status: 200 });
	} catch (error) {
		if (error instanceof Error) {
			return sendError(c, error);
		}
	}
});

// Add tags to a file
tagsRouter.post("/files/:fileId", async c => {
	const user = c.var.user;

	try {
		// Validation
		const { error: paramError, data: paramData } = addTagsToFileSchema.safeParse({
			fileId: c.req.param("fileId"),
			...(await c.req.json()),
		});
		if (paramError) {
			return sendError(c, paramError);
		}

		// Add tags to file
		const fileTags = await tagService.addTagsToFile(paramData.fileId, paramData.tagIds, user.id);
		return sendSuccess(c, { data: fileTags });
	} catch (error) {
		if (error instanceof Error) {
			return sendError(c, error);
		}
	}
});

// Remove tags from a file
tagsRouter.delete("/files/:fileId", async c => {
	const user = c.var.user;

	try {
		// Validation
		const { error: paramError, data: paramData } = removeTagsFromFileSchema.safeParse({
			fileId: c.req.param("fileId"),
			...(await c.req.json()),
		});
		if (paramError) {
			return sendError(c, paramError);
		}

		await tagService.removeTagsFromFile(paramData.fileId, paramData.tagIds, user.id);
		return sendSuccess(c, { message: "Tags removed from file successfully", status: 200 });
	} catch (error) {
		if (error instanceof Error) {
			return sendError(c, error);
		}
	}
});

// Get all tags for a specific file
tagsRouter.get("/files/:fileId", async c => {
	const user = c.var.user;

	try {
		const fileId = c.req.param("fileId");
		const tags = await tagService.getFileTags(fileId, user.id);
		return sendSuccess(c, { data: tags });
	} catch (error) {
		if (error instanceof Error) {
			return sendError(c, error);
		}
	}
});

export default tagsRouter;

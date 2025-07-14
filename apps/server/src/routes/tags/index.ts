import {
	createTagSchema,
	updateTagSchema,
	deleteTagSchema,
	getTagByIdSchema,
	addTagsToFileSchema,
	removeTagsFromFileSchema,
} from "@/validators";
import type { TagOperationResponse, FileTagOperationResponse } from "@/routes/types";
import { TagService } from "@/routes/tags/tag-service";
import type { Context } from "hono";
import { Hono } from "hono";

const tagsRouter = new Hono();
const tagService = new TagService();

// Get all tags for the authenticated user
tagsRouter.get("/", async (c: Context) => {
	const user = c.get("user");

	try {
		const tags = await tagService.getUserTags(user.id);
		return c.json<TagOperationResponse>({ success: true, message: "Tags retrieved successfully", data: tags });
	} catch (error) {
		return c.json<TagOperationResponse>(
			{ success: false, message: error instanceof Error ? error.message : "Failed to get tags" },
			500
		);
	}
});

// Get a specific tag by tag id (and the authenticated user id)
tagsRouter.get("/:id", async (c: Context) => {
	const user = c.get("user");

	// Validation
	const { error, data } = getTagByIdSchema.safeParse(c.req.param());
	if (error) {
		return c.json<TagOperationResponse>(
			{ success: false, message: error.errors[0]?.message || "Validation error" },
			400
		);
	}

	try {
		const tag = await tagService.getTagById(data.id, user.id);
		if (!tag) {
			return c.json<TagOperationResponse>({ success: false, message: "Tag not found" }, 404);
		}
		return c.json<TagOperationResponse>({ success: true, message: "Tag retrieved successfully", data: tag });
	} catch (error) {
		return c.json<TagOperationResponse>(
			{ success: false, message: error instanceof Error ? error.message : "Failed to get tag" },
			500
		);
	}
});

// Create a new tag
tagsRouter.post("/", async (c: Context) => {
	const user = c.get("user");

	try {
		// Validation
		const { error, data } = createTagSchema.safeParse(await c.req.json());
		if (error) {
			return c.json<TagOperationResponse>(
				{ success: false, message: error.errors[0]?.message || "Validation error" },
				400
			);
		}

		// Create tag
		const newTag = await tagService.createTag(user.id, data.name, data.color, data.parentId);
		return c.json<TagOperationResponse>({ success: true, message: "Tag created successfully", data: newTag }, 201);
	} catch (error) {
		return c.json<TagOperationResponse>(
			{ success: false, message: error instanceof Error ? error.message : "Failed to create tag" },
			500
		);
	}
});

// Update an existing tag
tagsRouter.put("/:id", async (c: Context) => {
	const user = c.get("user");

	// Validation
	const { error: paramError, data: paramData } = getTagByIdSchema.safeParse(c.req.param());
	if (paramError) {
		return c.json<TagOperationResponse>(
			{ success: false, message: paramError.errors[0]?.message || "Validation error" },
			400
		);
	}

	try {
		const { error: bodyError, data: bodyData } = updateTagSchema.safeParse(await c.req.json());
		if (bodyError) {
			return c.json<TagOperationResponse>(
				{ success: false, message: bodyError.errors[0]?.message || "Validation error" },
				400
			);
		}
		const updatedTag = await tagService.updateTag(paramData.id, user.id, bodyData);
		return c.json<TagOperationResponse>({ success: true, message: "Tag updated successfully", data: updatedTag });
	} catch (error) {
		return c.json<TagOperationResponse>(
			{ success: false, message: error instanceof Error ? error.message : "Failed to update tag" },
			500
		);
	}
});

// Delete a tag
tagsRouter.delete("/:id", async (c: Context) => {
	const user = c.get("user");

	// Validation
	const { error, data } = deleteTagSchema.safeParse(c.req.param());
	if (error) {
		return c.json<TagOperationResponse>(
			{ success: false, message: error.errors[0]?.message || "Validation error" },
			400
		);
	}

	try {
		await tagService.deleteTag(data.id, user.id);
		return c.json<TagOperationResponse>({ success: true, message: "Tag deleted successfully" });
	} catch (error) {
		return c.json<TagOperationResponse>(
			{ success: false, message: error instanceof Error ? error.message : "Failed to delete tag" },
			500
		);
	}
});

// Add tags to a file
tagsRouter.post("/files/:fileId", async (c: Context) => {
	const user = c.get("user");

	try {
		// Validation
		const { error: paramError, data: paramData } = addTagsToFileSchema.safeParse({
			fileId: c.req.param("fileId"),
			...(await c.req.json()),
		});
		if (paramError) {
			return c.json<FileTagOperationResponse>(
				{ success: false, message: paramError.errors[0]?.message || "Validation error" },
				400
			);
		}

		// Add tags to file
		const fileTags = await tagService.addTagsToFile(paramData.fileId, paramData.tagIds, user.id);
		return c.json<FileTagOperationResponse>({
			success: true,
			message: "Tags added to file successfully",
			data: fileTags,
		});
	} catch (error) {
		return c.json<FileTagOperationResponse>(
			{ success: false, message: error instanceof Error ? error.message : "Failed to add tags to file" },
			500
		);
	}
});

// Remove tags from a file
tagsRouter.delete("/files/:fileId", async (c: Context) => {
	const user = c.get("user");

	try {
		// Validation
		const { error: paramError, data: paramData } = removeTagsFromFileSchema.safeParse({
			fileId: c.req.param("fileId"),
			...(await c.req.json()),
		});
		if (paramError) {
			return c.json<FileTagOperationResponse>(
				{ success: false, message: paramError.errors[0]?.message || "Validation error" },
				400
			);
		}

		await tagService.removeTagsFromFile(paramData.fileId, paramData.tagIds, user.id);
		return c.json<FileTagOperationResponse>({ success: true, message: "Tags removed from file successfully" });
	} catch (error) {
		return c.json<FileTagOperationResponse>(
			{ success: false, message: error instanceof Error ? error.message : "Failed to remove tags from file" },
			500
		);
	}
});

// Get all tags for a specific file
tagsRouter.get("/files/:fileId", async (c: Context) => {
	const user = c.get("user");

	try {
		const fileId = c.req.param("fileId");
		const tags = await tagService.getFileTags(fileId, user.id);
		return c.json<TagOperationResponse>({ success: true, message: "File tags retrieved successfully", data: tags });
	} catch (error) {
		return c.json<TagOperationResponse>(
			{ success: false, message: error instanceof Error ? error.message : "Failed to get file tags" },
			500
		);
	}
});

export default tagsRouter;

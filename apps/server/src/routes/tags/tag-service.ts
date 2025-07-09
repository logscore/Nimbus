import { eq, and, inArray, count, isNull } from "drizzle-orm";
import type { Tag, FileTag } from "@/routes/types";
import { tag, fileTag } from "@nimbus/db/schema";
import { createDb } from "@nimbus/db";
import { nanoid } from "nanoid";
import env from "@nimbus/env";

export class TagService {
	// Get all tags for a user with file counts
	async getUserTags(userId: string): Promise<Tag[]> {
		// Get all tags for the user
		const userTags = await createDb(env.DATABASE_URL)
			.select()
			.from(tag)
			.where(eq(tag.userId, userId))
			.orderBy(tag.name);

		// Get file counts for each tag
		const tagsWithCounts = await Promise.all(
			userTags.map(async tagRecord => {
				const fileCount = await createDb(env.DATABASE_URL)
					.select({ count: count() })
					.from(fileTag)
					.where(and(eq(fileTag.tagId, tagRecord.id), eq(fileTag.userId, userId)));

				return {
					...tagRecord,
					_count: fileCount[0]?.count || 0,
					parentId: tagRecord.parentId || undefined,
					createdAt: tagRecord.createdAt.toISOString(),
					updatedAt: tagRecord.updatedAt.toISOString(),
				};
			})
		);

		// Build hierarchical structure
		return this.buildTagHierarchy(tagsWithCounts);
	}

	// Get a specific tag by ID
	async getTagById(tagId: string, userId: string): Promise<Tag | null> {
		const db = createDb(env.DATABASE_URL);
		const tagRecord = await db
			.select()
			.from(tag)
			.where(and(eq(tag.id, tagId), eq(tag.userId, userId)))
			.limit(1);

		if (!tagRecord.length) return null;

		const fileCount = await db
			.select({ count: count() })
			.from(fileTag)
			.where(and(eq(fileTag.tagId, tagId), eq(fileTag.userId, userId)));

		const record = tagRecord[0];
		if (!record) return null;

		return {
			id: record.id,
			name: record.name,
			color: record.color,
			parentId: record.parentId || undefined,
			userId: record.userId,
			_count: fileCount[0]?.count || 0,
			createdAt: record.createdAt.toISOString(),
			updatedAt: record.updatedAt.toISOString(),
		};
	}

	// Create a new tag
	async createTag(userId: string, name: string, color: string, parentId?: string | null): Promise<Tag> {
		const db = createDb(env.DATABASE_URL);
		// Check if parent tag exists and belongs to user
		if (parentId) {
			const parentTag = await this.getTagById(parentId, userId);
			if (!parentTag) {
				throw new Error("Parent tag not found");
			}
		}

		// Check if tag name already exists for this user and parent
		const existingTagQuery = parentId
			? and(eq(tag.name, name), eq(tag.userId, userId), eq(tag.parentId, parentId))
			: and(eq(tag.name, name), eq(tag.userId, userId), isNull(tag.parentId));

		const existingTag = await db.select().from(tag).where(existingTagQuery).limit(1);

		if (existingTag.length > 0) {
			throw new Error("Tag with this name already exists");
		}

		const newTag = {
			id: nanoid(),
			name,
			color,
			parentId: parentId || null,
			userId,
		};

		await db.insert(tag).values(newTag);

		return {
			...newTag,
			_count: 0,
			parentId: newTag.parentId || undefined,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
	}

	// Update an existing tag
	async updateTag(
		tagId: string,
		userId: string,
		updates: { name?: string; color?: string; parentId?: string | null }
	): Promise<Tag> {
		const db = createDb(env.DATABASE_URL);
		// Check if tag exists and belongs to user
		const existingTag = await this.getTagById(tagId, userId);
		if (!existingTag) {
			throw new Error("Tag not found");
		}

		// Check if new parent tag exists and belongs to user
		if (updates.parentId && updates.parentId !== existingTag.parentId) {
			const parentTag = await this.getTagById(updates.parentId, userId);
			if (!parentTag) {
				throw new Error("Parent tag not found");
			}
			if (updates.parentId === tagId) {
				throw new Error("Tag cannot be its own parent");
			}
		}

		// Check if new name already exists for this user and parent
		if (updates.name && updates.name !== existingTag.name) {
			const newParentId = updates.parentId !== undefined ? updates.parentId : existingTag.parentId;
			const nameConflictQuery = newParentId
				? and(eq(tag.name, updates.name), eq(tag.userId, userId), eq(tag.parentId, newParentId))
				: and(eq(tag.name, updates.name), eq(tag.userId, userId), isNull(tag.parentId));

			const nameConflict = await db.select().from(tag).where(nameConflictQuery).limit(1);

			if (nameConflict.length > 0) {
				throw new Error("Tag with this name already exists");
			}
		}

		const updateData: Partial<typeof tag.$inferInsert> = {};

		if (updates.name) updateData.name = updates.name;
		if (updates.color) updateData.color = updates.color;
		if (updates.parentId !== undefined) updateData.parentId = updates.parentId || null;
		updateData.updatedAt = new Date();

		await db
			.update(tag)
			.set(updateData)
			.where(and(eq(tag.id, tagId), eq(tag.userId, userId)));

		return (await this.getTagById(tagId, userId)) as Tag;
	}

	// Delete a tag and all its children
	async deleteTag(tagId: string, userId: string): Promise<void> {
		const db = createDb(env.DATABASE_URL);
		// Check if tag exists and belongs to user
		const existingTag = await this.getTagById(tagId, userId);
		if (!existingTag) {
			throw new Error("Tag not found");
		}

		// Delete all file associations for this tag and its children
		const childTagIds = await this.getAllChildTagIds(tagId, userId);
		const allTagIds = [tagId, ...childTagIds];

		await db.delete(fileTag).where(and(inArray(fileTag.tagId, allTagIds), eq(fileTag.userId, userId)));

		// Delete the tag and all its children
		await db.delete(tag).where(and(inArray(tag.id, allTagIds), eq(tag.userId, userId)));
	}

	// Add tags to a file
	async addTagsToFile(fileId: string, tagIds: string[], userId: string): Promise<FileTag[]> {
		const db = createDb(env.DATABASE_URL);
		// Verify all tags exist and belong to user
		for (const tagId of tagIds) {
			const tagExists = await this.getTagById(tagId, userId);
			if (!tagExists) {
				throw new Error(`Tag not found`);
			}
		}

		// Check for existing associations
		const existingAssociations = await db
			.select()
			.from(fileTag)
			.where(and(eq(fileTag.fileId, fileId), inArray(fileTag.tagId, tagIds), eq(fileTag.userId, userId)));

		const existingTagIds = existingAssociations.map(assoc => assoc.tagId);
		const newTagIds = tagIds.filter(tagId => !existingTagIds.includes(tagId));

		if (newTagIds.length === 0) {
			return existingAssociations.map(assoc => ({
				...assoc,
				createdAt: assoc.createdAt.toISOString(),
			}));
		}

		// Create new associations
		const newAssociations = newTagIds.map(tagId => ({
			id: nanoid(),
			fileId,
			tagId,
			userId,
		}));

		await db.insert(fileTag).values(newAssociations);

		const newAssociationsWithDates = newAssociations.map(assoc => ({
			...assoc,
			createdAt: new Date().toISOString(),
		}));

		return [
			...existingAssociations.map(assoc => ({
				...assoc,
				createdAt: assoc.createdAt.toISOString(),
			})),
			...newAssociationsWithDates,
		];
	}

	// Remove tags from a file
	async removeTagsFromFile(fileId: string, tagIds: string[], userId: string): Promise<void> {
		await createDb(env.DATABASE_URL)
			.delete(fileTag)
			.where(and(eq(fileTag.fileId, fileId), inArray(fileTag.tagId, tagIds), eq(fileTag.userId, userId)));
	}

	// Get all tags for a specific file
	async getFileTags(fileId: string, userId: string): Promise<Tag[]> {
		const db = createDb(env.DATABASE_URL);
		const fileTagAssociations = await db
			.select({
				tagId: fileTag.tagId,
			})
			.from(fileTag)
			.where(and(eq(fileTag.fileId, fileId), eq(fileTag.userId, userId)));

		const tagIds = fileTagAssociations.map(assoc => assoc.tagId);

		if (tagIds.length === 0) return [];

		const tags = await db
			.select()
			.from(tag)
			.where(and(inArray(tag.id, tagIds), eq(tag.userId, userId)));

		return tags.map(tagRecord => ({
			...tagRecord,
			parentId: tagRecord.parentId || undefined,
			createdAt: tagRecord.createdAt.toISOString(),
			updatedAt: tagRecord.updatedAt.toISOString(),
		}));
	}

	// Get all child tag IDs recursively
	private async getAllChildTagIds(parentId: string, userId: string): Promise<string[]> {
		const childTags = await createDb(env.DATABASE_URL)
			.select({ id: tag.id })
			.from(tag)
			.where(and(eq(tag.parentId, parentId), eq(tag.userId, userId)));

		const childIds = childTags.map(tag => tag.id);
		const grandChildIds = await Promise.all(childIds.map(childId => this.getAllChildTagIds(childId, userId)));

		return [...childIds, ...grandChildIds.flat()];
	}

	// Build hierarchical tag structure
	private buildTagHierarchy(tags: Tag[]): Tag[] {
		const tagMap = new Map<string, Tag>();
		const rootTags: Tag[] = [];

		// Create a map of all tags
		tags.forEach(tag => {
			tagMap.set(tag.id, { ...tag, children: [] });
		});

		// Build hierarchy
		tags.forEach(tag => {
			const tagWithChildren = tagMap.get(tag.id);
			if (tagWithChildren) {
				if (tag.parentId && tagMap.has(tag.parentId)) {
					const parent = tagMap.get(tag.parentId)!;
					if (parent) {
						parent.children = parent.children || [];
						parent.children.push(tagWithChildren);
					}
				} else {
					rootTags.push(tagWithChildren);
				}
			}
		});

		return rootTags;
	}

	// Delete all fileTag associations for a file
	async deleteFileTagsByFileId(fileId: string, userId: string): Promise<void> {
		await createDb(env.DATABASE_URL)
			.delete(fileTag)
			.where(and(eq(fileTag.fileId, fileId), eq(fileTag.userId, userId)));
	}
}

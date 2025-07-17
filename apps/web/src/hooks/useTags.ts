import { createTagSchema, updateTagSchema, type CreateTagSchema, type UpdateTagSchema } from "@nimbus/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccountProvider } from "@/components/providers/account-provider";
import type { DriveProviderClient } from "@/utils/client";
import type { Tag } from "@nimbus/shared";
import { toast } from "sonner";

const TAGS_QUERY_KEY = "tags";

export function useTags() {
	const queryClient = useQueryClient();
	const { clientPromise, providerId, accountId } = useAccountProvider();

	const {
		data: tags,
		isLoading,
		error,
	} = useQuery<Tag[]>({
		queryKey: [TAGS_QUERY_KEY, providerId, accountId],
		queryFn: () => getTags(clientPromise),
	});

	const createTagMutation = useMutation({
		mutationFn: (data: CreateTagSchema) => {
			// Validate data before sending to API
			const validatedData = createTagSchema.parse(data);
			return createTag(validatedData, clientPromise);
		},
		onSuccess: newTag => {
			toast.success("Tag created successfully");
			// update data locally with the new tag
			queryClient.setQueryData<Tag[]>([TAGS_QUERY_KEY], (oldData = []) => {
				const addRecursive = (tags: Tag[]): Tag[] => {
					return tags.map(tag => {
						if (tag.id === newTag.parentId) {
							return { ...tag, children: [...(tag.children || []), newTag] };
						}
						if (tag.children) {
							return { ...tag, children: addRecursive(tag.children) };
						}
						return tag;
					});
				};
				if (newTag.parentId) {
					return addRecursive(oldData);
				}
				return [...oldData, newTag];
			});
		},
		onError: (error: Error) => {
			if (error instanceof Error && error.name === "ZodError") {
				toast.error("Invalid tag data. Please check your input.");
			} else {
				toast.error(error.message || "Failed to create tag");
			}
		},
	});

	const updateTagMutation = useMutation({
		mutationFn: (data: UpdateTagSchema) => {
			// Validate data before sending to API
			const validatedData = updateTagSchema.parse(data);
			return updateTag(validatedData, clientPromise);
		},
		onSuccess: () => {
			toast.success("Tag updated successfully");
			// Invalidate the query to get the latest data
			void queryClient.invalidateQueries({ queryKey: [TAGS_QUERY_KEY] });
		},
		onError: error => {
			if (error instanceof Error && error.name === "ZodError") {
				toast.error("Invalid tag data. Please check your input.");
			} else {
				toast.error(error.message || "Failed to update tag");
			}
		},
	});

	const deleteTagMutation = useMutation({
		mutationFn: (id: string) => deleteTag(id, clientPromise),
		onSuccess: (_, deletedId) => {
			toast.success("Tag deleted successfully");
			// remove the tag and all its descendants from the local data
			queryClient.setQueryData<Tag[]>([TAGS_QUERY_KEY], (oldData = []) => {
				// First, find all descendant IDs to remove
				const getDescendantIds = (tags: Tag[], targetId: string): string[] => {
					const descendants: string[] = [];

					const findDescendants = (tagList: Tag[]) => {
						for (const tag of tagList) {
							if (tag.id === targetId) {
								// Found the target tag, collect all its children
								if (tag.children) {
									const collectChildren = (children: Tag[]) => {
										for (const child of children) {
											descendants.push(child.id);
											if (child.children) {
												collectChildren(child.children);
											}
										}
									};
									collectChildren(tag.children);
								}
								return;
							}
							if (tag.children) {
								findDescendants(tag.children);
							}
						}
					};

					findDescendants(tags);
					return descendants;
				};

				const descendantIds = getDescendantIds(oldData, deletedId);
				const allIdsToRemove = [deletedId, ...descendantIds];

				// Remove all tags (parent and descendants)
				const removeRecursive = (tags: Tag[], idsToRemove: string[]): Tag[] => {
					return tags
						.filter(tag => !idsToRemove.includes(tag.id))
						.map(tag => {
							if (tag.children && tag.children.length > 0) {
								return { ...tag, children: removeRecursive(tag.children, idsToRemove) };
							}
							return tag;
						});
				};

				return removeRecursive(oldData, allIdsToRemove);
			});
		},
		onError: error => {
			toast.error(error.message || "Failed to delete tag");
		},
	});

	const addTagsToFileMutation = useMutation({
		mutationFn: (variables: { fileId: string; tagIds: string[]; onSuccess?: () => void }) =>
			addTagsToFile(variables, clientPromise),
		onSuccess: (_data, variables) => {
			toast.success("Tag added to file successfully");
			// Update cache locally by incrementing count for each added tag
			queryClient.setQueryData<Tag[]>([TAGS_QUERY_KEY], (oldData = []) => {
				const updateCountRecursive = (tags: Tag[]): Tag[] => {
					return tags.map(tag => {
						if (variables.tagIds.includes(tag.id)) {
							return { ...tag, _count: (tag._count || 0) + 1 };
						}
						if (tag.children) {
							return { ...tag, children: updateCountRecursive(tag.children) };
						}
						return tag;
					});
				};
				return updateCountRecursive(oldData);
			});
			variables.onSuccess?.();
		},
		onError: error => {
			toast.error(error.message || "Failed to add tag to file");
		},
	});

	const removeTagsFromFileMutation = useMutation({
		mutationFn: (variables: { fileId: string; tagIds: string[]; onSuccess?: () => void }) =>
			removeTagsFromFile(variables, clientPromise),
		onSuccess: (_data, variables) => {
			toast.success("Tag removed from file successfully");
			// Update cache locally by decrementing count for each removed tag
			queryClient.setQueryData<Tag[]>([TAGS_QUERY_KEY], (oldData = []) => {
				const updateCountRecursive = (tags: Tag[]): Tag[] => {
					return tags.map(tag => {
						if (variables.tagIds.includes(tag.id)) {
							return { ...tag, _count: Math.max(0, (tag._count || 0) - 1) };
						}
						if (tag.children) {
							return { ...tag, children: updateCountRecursive(tag.children) };
						}
						return tag;
					});
				};
				return updateCountRecursive(oldData);
			});
			variables.onSuccess?.();
		},
		onError: error => {
			toast.error(error.message || "Failed to remove tag from file");
		},
	});

	return {
		tags: tags ?? [],
		isLoading,
		error,
		createTag: createTagMutation.mutate,
		updateTag: updateTagMutation.mutate,
		deleteTag: deleteTagMutation.mutate,
		addTagsToFile: addTagsToFileMutation.mutate,
		removeTagsFromFile: removeTagsFromFileMutation.mutate,
	};
}

async function getBaseTagClient(clientPromise: Promise<DriveProviderClient>) {
	const client = await clientPromise;
	const BASE_TAG_CLIENT = client.api.tags;
	return BASE_TAG_CLIENT;
}

async function getTags(clientPromise: Promise<DriveProviderClient>): Promise<Tag[]> {
	const BASE_TAG_CLIENT = await getBaseTagClient(clientPromise);
	const response = await BASE_TAG_CLIENT.$get();
	return (await response.json()) as Tag[];
}

async function createTag(data: CreateTagSchema, clientPromise: Promise<DriveProviderClient>): Promise<Tag> {
	const BASE_TAG_CLIENT = await getBaseTagClient(clientPromise);
	const response = await BASE_TAG_CLIENT.$post({ json: data });
	return (await response.json()) as Tag;
}

async function updateTag(data: UpdateTagSchema, clientPromise: Promise<DriveProviderClient>): Promise<Tag> {
	const BASE_TAG_CLIENT = await getBaseTagClient(clientPromise);
	const { id, ...updateData } = data;
	const response = await BASE_TAG_CLIENT[":id"].$put({
		param: { id },
		json: updateData,
	});
	return (await response.json()) as Tag;
}

async function deleteTag(id: string, clientPromise: Promise<DriveProviderClient>): Promise<void> {
	const BASE_TAG_CLIENT = await getBaseTagClient(clientPromise);
	await BASE_TAG_CLIENT[":id"].$delete({
		param: { id },
	});
}

async function addTagsToFile(
	variables: { fileId: string; tagIds: string[]; onSuccess?: () => void },
	clientPromise: Promise<DriveProviderClient>
): Promise<void> {
	const BASE_TAG_CLIENT = await getBaseTagClient(clientPromise);
	await BASE_TAG_CLIENT.files[":fileId"].$post({
		param: { fileId: variables.fileId },
		json: { tagIds: variables.tagIds },
	});
}

async function removeTagsFromFile(
	variables: {
		fileId: string;
		tagIds: string[];
		onSuccess?: () => void;
	},
	clientPromise: Promise<DriveProviderClient>
): Promise<void> {
	const BASE_TAG_CLIENT = await getBaseTagClient(clientPromise);
	await BASE_TAG_CLIENT.files[":fileId"].$delete({
		param: { fileId: variables.fileId },
		json: { tagIds: variables.tagIds },
	});
}

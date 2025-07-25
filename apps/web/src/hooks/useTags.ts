import { createTagSchema, updateTagSchema, type CreateTagSchema, type UpdateTagSchema } from "@nimbus/shared";
import { useUserInfoProvider } from "@/components/providers/user-info-provider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccountProvider } from "@/components/providers/account-provider";
import type { DriveProviderClient } from "@/utils/client";
import type { File, Tag } from "@nimbus/shared";
import { toast } from "sonner";

const TAGS_QUERY_KEY = "tags";
const FILES_QUERY_KEY = "files";

export function useTags(parentId?: string) {
	const queryClient = useQueryClient();
	const { clientPromise, providerId, accountId } = useAccountProvider();

	const { user } = useUserInfoProvider();

	const tagsQueryKey = [TAGS_QUERY_KEY, providerId, accountId];
	const filesQueryKey = [FILES_QUERY_KEY, providerId, accountId, parentId];

	const {
		data: tags,
		isLoading,
		error,
	} = useQuery<Tag[]>({
		queryKey: tagsQueryKey,
		queryFn: () => getTags(clientPromise),
		enabled: !!providerId && !!accountId,
	});

	const createTagMutation = useMutation({
		mutationFn: (data: CreateTagSchema) => {
			const validatedData = createTagSchema.parse(data);
			return createTag(validatedData, clientPromise);
		},
		onMutate: async newTagData => {
			await queryClient.cancelQueries({ queryKey: tagsQueryKey });
			const previousTags = queryClient.getQueryData<Tag[]>(tagsQueryKey);

			const optimisticTag: Tag = {
				...newTagData,
				id: `temp-${Date.now()}`,
				children: [],
				userId: user?.id || "",
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				_count: 0,
			};

			queryClient.setQueryData<Tag[]>(tagsQueryKey, (oldData = []) => {
				const addRecursive = (tags: Tag[]): Tag[] => {
					return tags.map(tag => {
						if (tag.id === optimisticTag.parentId) {
							return { ...tag, children: [...(tag.children || []), optimisticTag] };
						}
						if (tag.children) {
							return { ...tag, children: addRecursive(tag.children) };
						}
						return tag;
					});
				};

				if (optimisticTag.parentId) {
					return addRecursive(oldData);
				}
				return [...oldData, optimisticTag];
			});

			return { previousTags, optimisticTag };
		},
		onSuccess: (newTag, variables, context) => {
			toast.success("Tag created successfully");

			queryClient.setQueryData<Tag[]>(tagsQueryKey, (oldData = []) => {
				const replaceRecursive = (tags: Tag[]): Tag[] => {
					return tags.map(tag => {
						if (tag.id === context?.optimisticTag.id) {
							return newTag;
						}
						if (tag.children) {
							return { ...tag, children: replaceRecursive(tag.children) };
						}
						return tag;
					});
				};
				return replaceRecursive(oldData);
			});
		},
		onError: (error: Error, _, context) => {
			if (context?.previousTags) {
				queryClient.setQueryData(tagsQueryKey, context.previousTags);
			}

			if (error instanceof Error && error.name === "ZodError") {
				toast.error("Invalid tag data. Please check your input.");
			} else {
				toast.error(error.message || "Failed to create tag");
			}
		},
	});

	const updateTagMutation = useMutation({
		mutationFn: (data: UpdateTagSchema) => {
			const validatedData = updateTagSchema.parse(data);
			return updateTag(validatedData, clientPromise);
		},
		onMutate: async updatedTag => {
			await queryClient.cancelQueries({ queryKey: tagsQueryKey });
			const previousTags = queryClient.getQueryData<Tag[]>(tagsQueryKey);

			queryClient.setQueryData<Tag[]>(tagsQueryKey, (oldData = []) => {
				const updateRecursive = (tags: Tag[]): Tag[] => {
					return tags.map(tag => {
						if (tag.id === updatedTag.id) {
							return { ...tag, ...updatedTag, updatedAt: new Date().toISOString() };
						}
						if (tag.children) {
							return { ...tag, children: updateRecursive(tag.children) };
						}
						return tag;
					});
				};
				return updateRecursive(oldData);
			});

			return { previousTags };
		},
		onSuccess: updatedTag => {
			toast.success("Tag updated successfully");

			// Replace optimistic update with real data
			queryClient.setQueryData<Tag[]>(tagsQueryKey, (oldData = []) => {
				const replaceRecursive = (tags: Tag[]): Tag[] => {
					return tags.map(tag => {
						if (tag.id === updatedTag.id) {
							return updatedTag;
						}
						if (tag.children) {
							return { ...tag, children: replaceRecursive(tag.children) };
						}
						return tag;
					});
				};
				return replaceRecursive(oldData);
			});
		},
		onError: (error, _, context) => {
			if (context?.previousTags) {
				queryClient.setQueryData(tagsQueryKey, context.previousTags);
			}
			toast.error(error.message || "Failed to update tag");
		},
	});

	const deleteTagMutation = useMutation({
		mutationFn: (id: string) => deleteTag(id, clientPromise),
		onMutate: async id => {
			await queryClient.cancelQueries({ queryKey: tagsQueryKey });
			const previousTags = queryClient.getQueryData<Tag[]>(tagsQueryKey) || [];

			queryClient.setQueryData<Tag[]>(tagsQueryKey, (oldData = []) => {
				const getDescendantIds = (tags: Tag[], targetId: string): string[] => {
					const descendants: string[] = [];
					const findDescendants = (tagList: Tag[]) => {
						for (const tag of tagList) {
							if (tag.id === targetId) {
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

				const descendantIds = getDescendantIds(oldData, id);
				const allIdsToRemove = [id, ...descendantIds];

				const removeRecursive = (tags: Tag[], idsToRemove: string[]): Tag[] => {
					return tags
						.filter(tag => !idsToRemove.includes(tag.id))
						.map(tag => ({
							...tag,
							children: tag.children ? removeRecursive(tag.children, idsToRemove) : undefined,
						}));
				};

				return removeRecursive(oldData, allIdsToRemove);
			});

			return { previousTags };
		},
		onSuccess: () => {
			toast.success("Tag deleted successfully");
		},
		onError: (error, _, context) => {
			if (context?.previousTags) {
				queryClient.setQueryData(tagsQueryKey, context.previousTags);
			}
			toast.error(error.message || "Failed to delete tag");
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({ queryKey: tagsQueryKey });
		},
	});

	const addTagsToFileMutation = useMutation({
		mutationFn: (variables: { fileId: string; tagIds: string[]; onSuccess?: () => void }) =>
			addTagsToFile(variables, clientPromise),
		onMutate: async variables => {
			const { fileId, tagIds } = variables;
			await queryClient.cancelQueries({ queryKey: filesQueryKey });
			const previousFiles = queryClient.getQueryData<File[]>(filesQueryKey) || [];

			// Get the tags that are being added
			const tagsToAdd = queryClient.getQueryData<Tag[]>(tagsQueryKey)?.filter(tag => tagIds.includes(tag.id)) || [];

			// Optimistically update the file with the new tags
			queryClient.setQueryData<File[]>(filesQueryKey, (oldData = []) => {
				return oldData.map(file => {
					if (file.id === fileId) {
						const existingTagIds = new Set(file.tags?.map(tag => tag.id) || []);
						const newTags = [...(file.tags || []), ...tagsToAdd.filter(tag => !existingTagIds.has(tag.id))];

						return {
							...file,
							tags: newTags,
						};
					}
					return file;
				});
			});

			return { previousFiles };
		},
		onSuccess: (_data, variables) => {
			toast.success("Tag added to file successfully");
			variables.onSuccess?.();
		},
		onError: (error, _, context) => {
			if (context?.previousFiles) {
				queryClient.setQueryData(filesQueryKey, context.previousFiles);
			}
			toast.error(error.message || "Failed to add tag to file");
		},
		onSettled: async () => {
			// Invalidate both files and tags queries to ensure consistency
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: filesQueryKey }),
				queryClient.invalidateQueries({ queryKey: tagsQueryKey }),
			]);
		},
	});

	const removeTagsFromFileMutation = useMutation({
		mutationFn: (variables: { fileId: string; tagIds: string[]; onSuccess?: () => void }) =>
			removeTagsFromFile(variables, clientPromise),
		onMutate: async variables => {
			const { fileId, tagIds } = variables;
			await queryClient.cancelQueries({ queryKey: filesQueryKey });
			const previousFiles = queryClient.getQueryData<File[]>(filesQueryKey) || [];

			// Optimistically update the file by removing the specified tags
			queryClient.setQueryData<File[]>(filesQueryKey, (oldData = []) => {
				return oldData.map(file => {
					if (file.id === fileId) {
						const updatedTags = (file.tags || []).filter(tag => !tagIds.includes(tag.id));

						return {
							...file,
							tags: updatedTags,
						};
					}
					return file;
				});
			});

			return { previousFiles };
		},
		onSuccess: (_data, variables) => {
			toast.success("Tag removed from file successfully");
			variables.onSuccess?.();
		},
		onError: (error, _, context) => {
			if (context?.previousFiles) {
				queryClient.setQueryData(filesQueryKey, context.previousFiles);
			}
			toast.error(error.message || "Failed to remove tag from file");
		},
		onSettled: async () => {
			// Invalidate both files and tags queries to ensure consistency
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: filesQueryKey }),
				queryClient.invalidateQueries({ queryKey: tagsQueryKey }),
			]);
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

// API functions remain the same
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

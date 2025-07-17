//  TODO: Find a better implementation of this that provides instant breadcrumb fetching

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const API_BASE = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`;

const defaultAxiosConfig = {
	headers: {
		"Content-Type": "application/json",
	},
	withCredentials: true,
};

export interface BreadcrumbItem {
	id: string;
	name: string;
}

interface FileResponse {
	id: string;
	name: string;
	parent?: string; // Just the parent ID
}

async function fetchFile(parentId: string, returnedValues: string[]): Promise<FileResponse> {
	const response = await axios.get<FileResponse>(`${API_BASE}/files/${parentId}`, {
		params: { parentId, returnedValues },
		...defaultAxiosConfig,
	});
	return response.data;
}

async function fetchBreadcrumbPath(fileId: string): Promise<BreadcrumbItem[]> {
	// If fileId is empty or null, return empty array (root level)
	if (!fileId) {
		return [];
	}

	const breadcrumbs: BreadcrumbItem[] = [];
	let currentId: string | undefined = fileId;

	// Recursively fetch each file and its parent until we reach the root
	while (currentId) {
		const file = await fetchFile(currentId, ["id", "name", "parents"]);
		if (file.parent !== "") {
			breadcrumbs.unshift({
				id: file.id,
				name: file.name,
			});
		}
		currentId = file.parent;
	}

	return breadcrumbs;
}

export function useBreadcrumbPath(fileId?: string) {
	return useQuery({
		queryKey: ["files", "breadcrumb-path", fileId || "root"],
		queryFn: () => fetchBreadcrumbPath(fileId || ""),
		enabled: true,
		staleTime: Infinity,
		retry: 2,
		placeholderData: previousData => previousData, // Keep previous data while fetching so breadcrumb doesn't disappear
	});
}

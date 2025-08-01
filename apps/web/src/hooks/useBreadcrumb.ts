//  TODO: Find a better implementation of this that provides instant breadcrumb fetching

import { useAccountProvider } from "@/components/providers/account-provider";
import type { DriveProviderClient } from "@/utils/client";
import { handleUnauthorizedError } from "@/utils/client";
import { useQuery } from "@tanstack/react-query";

interface BreadcrumbItem {
	id: string;
	name: string;
}

export function useBreadcrumbPath(fileId?: string) {
	const { clientPromise } = useAccountProvider();

	return useQuery({
		queryKey: ["breadcrumbs", fileId],
		queryFn: async () => {
			if (!fileId) return [];

			const breadcrumbs: BreadcrumbItem[] = [];
			let currentId = fileId;

			while (currentId !== "root") {
				const BASE_FILE_CLIENT = await getBaseFileClient(clientPromise);
				const response = await handleUnauthorizedError(
					() =>
						BASE_FILE_CLIENT[":fileId"].$get({
							param: { fileId: currentId },
							query: { returnedValues: ["id", "name", "parents"] },
						}),
					"Failed to fetch file"
				);

				const file = await response.json();

				if (file.parentId !== "root") {
					breadcrumbs.unshift({
						id: file.id,
						name: file.name,
					});
				}

				currentId = file.parentId;
			}

			return breadcrumbs;
		},
		placeholderData: prevData => prevData,
	});
}

async function getBaseFileClient(clientPromise: Promise<DriveProviderClient>) {
	const client = await clientPromise;
	const BASE_FILE_CLIENT = client.api.files;
	return BASE_FILE_CLIENT;
}

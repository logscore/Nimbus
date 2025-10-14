import DndKitProvider from "@/components/providers/dnd-kit-provider";
import { FileTable } from "@/components/dashboard/file-browser";
import { createFileRoute } from "@tanstack/react-router";
import { useGetFiles } from "@/hooks/useFileOperations";
import { Header } from "@/components/dashboard/header";
import { Suspense } from "react";

type DashboardSearch = {
	folderId?: string;
};

export const Route = createFileRoute("/_protected/dashboard/$providerSlug/$accountId")({
	component: DrivePage,
	validateSearch: (search: Record<string, unknown>): DashboardSearch => {
		return {
			folderId: (search.folderId as string) || undefined,
		};
	},
});

function DrivePage() {
	const { folderId } = Route.useSearch();
	const currentFolderId = folderId ?? "root";

	const { data, isLoading, refetch, error } = useGetFiles({
		parentId: currentFolderId,
		pageSize: 30,
		pageToken: undefined,
		// TODO: implement sorting, filtering, pagination, and a generalized web content/view interfaces
		returnedValues: ["id", "name", "mimeType", "size", "modifiedTime", "webContentLink", "webViewLink"],
	});

	return (
		<>
			<Suspense fallback={null}>
				<DndKitProvider parentId={currentFolderId}>
					<Header />
					<FileTable files={data || []} isLoading={isLoading} refetch={refetch} error={error} />
				</DndKitProvider>
			</Suspense>
		</>
	);
}

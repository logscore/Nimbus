"use client";

import { FileTable } from "@/components/dashboard/file-browser";
import { useGetFiles } from "@/hooks/useFileOperations";
import { Header } from "@/components/dashboard/header";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

export default function DrivePage() {
	const searchParams = useSearchParams();
	const folderId = searchParams.get("folderId") ?? "root";

	const { data, isLoading, refetch, error } = useGetFiles({
		parentId: folderId,
		pageSize: 30,
		pageToken: undefined,
		// TODO: implement sorting, filtering, pagination, and a generalized web content/view interfaces
		returnedValues: ["id", "name", "mimeType", "size", "modifiedTime", "webContentLink", "webViewLink"],
	});

	return (
		<>
			<Suspense fallback={null}>
				<Header />
				<div className="flex flex-1 flex-col">
					<FileTable files={data || []} isLoading={isLoading} refetch={refetch} error={error} />
				</div>
			</Suspense>
		</>
	);
}

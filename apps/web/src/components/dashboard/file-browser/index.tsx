// TODO: Get rid of this file and just have the browser be here
"use client";

import { FileBrowserData } from "@/components/dashboard/file-browser/file-browser-data";
import { FilePreview } from "@/components/dashboard/file-browser/file-preview";
import { ErrorMessageWithRetry } from "@/components/error-message/with-retry";
import { useGetFiles } from "@/hooks/useFileOperations";
import { useSearchParams } from "next/navigation";
import { Loader } from "@/components/loader";

export function FileBrowser() {
	const searchParams = useSearchParams();
	const folderId = searchParams.get("folderId") ?? "root";

	const { data, refetch, isLoading, error } = useGetFiles({
		parentId: folderId,
		pageSize: 30,
		pageToken: undefined,
		// TODO: implement sorting, filtering, pagination, and a generalized web content/view interfaces
		returnedValues: ["id", "name", "mimeType", "size", "modifiedTime", "webContentLink", "webViewLink"],
	});

	return (
		<div className={`flex flex-1 flex-col space-y-4`}>
			{isLoading ? (
				<Loader />
			) : error ? (
				<ErrorMessageWithRetry error={error} retryFn={refetch} />
			) : (
				<FileBrowserData data={data} refetch={refetch} />
			)}

			<FilePreview />
		</div>
	);
}

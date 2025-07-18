"use client";

import { FileTable } from "@/components/dashboard/file-browser/test-file-browser";
// import { FileBrowser } from "@/components/dashboard/file-browser";
import { useGetFiles } from "@/hooks/useFileOperations";
import { Header } from "@/components/dashboard/header";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

export default function DrivePage() {
	const searchParams = useSearchParams();
	const folderId = searchParams.get("folderId") ?? "root";

	const { data, isLoading } = useGetFiles(
		folderId,
		30,
		// TODO: implement sorting, filtering, pagination, and a generalized web content/view interfaces
		["id", "name", "mimeType", "size", "modifiedTime", "webContentLink", "webViewLink"],
		undefined
	);
	return (
		<>
			<Suspense fallback={null}>
				<Header />
				<div className="flex flex-1 flex-col">
					{/* <FileBrowser /> */}
					<FileTable files={data} isLoading={isLoading} />
				</div>
			</Suspense>
		</>
	);
}

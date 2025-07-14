"use client";

import { FileBrowserData } from "@/components/dashboard/file-browser/file-browser-data";
import { FilePreview } from "@/components/dashboard/file-browser/file-preview";
import { ErrorMessageWithRetry } from "@/components/error-message/with-retry";
import { FileTabs } from "@/components/dashboard/file-browser/file-tabs";
import { useGetFiles } from "@/hooks/useFileOperations";
import { useSearchParams } from "next/navigation";
import { Loader } from "@/components/loader";
import { useEffect, useState } from "react";
import type { File } from "@nimbus/shared";

export function FileBrowser() {
	const searchParams = useSearchParams();
	const type = searchParams.get("type");
	const folderId = searchParams.get("folderId") ?? "root";

	const { data, refetch, isLoading, error } = useGetFiles(
		folderId,
		30,
		// TODO: implement sorting, filtering, pagination, and a generalized web content/view interfaces
		["id", "name", "mimeType", "size", "modifiedTime", "webContentLink", "webViewLink"],
		undefined
	);

	// Local state for optimistic updates
	const [localFiles, setLocalFiles] = useState<File[]>([]);
	const [originalFiles, setOriginalFiles] = useState<File[]>([]);

	// Update local state when server data changes
	useEffect(() => {
		if (data) {
			setLocalFiles(data);
			setOriginalFiles(data);
		}
	}, [data]);

	// Optimistic delete handler
	const handleOptimisticDelete = (fileId: string) => {
		setLocalFiles(prev => prev.filter(file => file.id !== fileId));
	};

	// Optimistic rename handler
	const handleOptimisticRename = (fileId: string, newName: string) => {
		setLocalFiles(prev => prev.map(file => (file.id === fileId ? { ...file, name: newName } : file)));
	};

	// Rollback handler for errors
	const handleRollback = () => {
		setLocalFiles(originalFiles);
	};

	return (
		<div className={`flex flex-1 flex-col space-y-4`}>
			<div className="flex items-center justify-between">
				<FileTabs type={type} />
			</div>

			{isLoading ? (
				<Loader />
			) : error ? (
				<ErrorMessageWithRetry error={error} retryFn={refetch} />
			) : (
				localFiles.length > 0 && (
					<FileBrowserData
						data={localFiles}
						refetch={refetch}
						onOptimisticDelete={handleOptimisticDelete}
						onOptimisticRename={handleOptimisticRename}
						onRollback={handleRollback}
					/>
				)
			)}

			<FilePreview />
		</div>
	);
}

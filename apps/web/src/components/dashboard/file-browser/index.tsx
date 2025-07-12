"use client";

import { FileBrowserData } from "@/components/dashboard/file-browser/file-browser-data";
import { FilePreview } from "@/components/dashboard/file-browser/file-preview";
import { ErrorMessageWithRetry } from "@/components/error-message/with-retry";
import { FileTabs } from "@/components/dashboard/file-browser/file-tabs";
import { useGetFiles } from "@/hooks/useFileOperations";
import { useSearchParams } from "next/navigation";
import { Loader } from "@/components/loader";
import { useState, useEffect } from "react";
import type { _File } from "@/lib/types";

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
	const [localFiles, setLocalFiles] = useState<_File[]>([]);
	const [originalFiles, setOriginalFiles] = useState<_File[]>([]);

	// Update local state when server data changes
	useEffect(() => {
		if (data) {
			let filteredFiles = [...data];

			if (type) {
				filteredFiles = data.filter((file: _File) => {
					const mimeType = file.mimeType?.toLowerCase() ?? "";
					const fileName = file.name?.toLowerCase() ?? "";

					switch (type) {
						case "folder":
							return mimeType === "application/vnd.google-apps.folder" || mimeType === "folder";
						case "document":
							return (
								// Google Docs
								mimeType.includes("application/vnd.google-apps.document") ||
								mimeType.includes("application/vnd.google-apps.spreadsheet") ||
								mimeType.includes("application/vnd.google-apps.presentation") ||
								// Microsoft Office
								mimeType.includes("officedocument") ||
								mimeType.includes("msword") ||
								// PDFs
								mimeType.includes("pdf") ||
								// Text files
								mimeType.includes("text/") ||
								// Common document extensions
								/\.(doc|docx|xls|xlsx|ppt|pptx|pdf|txt|rtf|odt|ods|odp)$/i.test(fileName)
							);
						case "media":
							return (
								// Images
								mimeType.includes("image/") ||
								// Videos
								mimeType.includes("video/") ||
								// Audio
								mimeType.includes("audio/") ||
								// Common media extensions
								/\.(jpg|jpeg|png|gif|bmp|webp|mp4|webm|mov|mp3|wav|ogg)$/i.test(fileName)
							);
						default:
							return true;
					}
				});
			}

			setLocalFiles(filteredFiles);
			setOriginalFiles(data);
		}
	}, [data, type]);

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

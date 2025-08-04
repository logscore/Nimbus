"use client";

import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { CircleAlert, CircleCheckBig, CloudUpload, RefreshCcw } from "lucide-react";
import { MAX_FILE_SIZE, MIME_TO_EXTENSION_MAP } from "@nimbus/shared";
import { useUploadFile } from "@/hooks/useFileOperations";
import { ErrorCode, useDropzone } from "react-dropzone";
import { AnimatePresence, motion } from "motion/react";
import { useSearchParams } from "next/navigation";
import { getModernFileIcon } from ".";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";
import { set } from "zod";

type FileUploadItem = {
	file: File;
	status: "idle" | "uploading" | "success" | "error";
	error?: string;
};

export default function DragNDropUploader({ children }: { children: React.ReactNode }) {
	const [fileStates, setFileStates] = useState<FileUploadItem[]>([]);
	const { mutate: uploadFile, isPending } = useUploadFile();

	const [openDialog, setOpenDialog] = useState(isPending);

	const searchParams = useSearchParams();
	const parentId = searchParams.get("folderId") ?? "root";

	const { getRootProps, isDragActive, acceptedFiles } = useDropzone({
		accept: MIME_TO_EXTENSION_MAP,
		multiple: true,
		noClick: true,
		noKeyboard: true,
		noDragEventsBubbling: true,
		maxFiles: 5,
		maxSize: MAX_FILE_SIZE,
		onDropAccepted: files => {
			setOpenDialog(true);
			setFileStates(files.map(file => ({ file, status: "uploading" })));
			files.forEach(file => {
				uploadFile(
					{ file, parentId },
					{
						onSuccess: () => {
							setFileStates(prev => prev.map(item => (item.file === file ? { ...item, status: "success" } : item)));
						},
						onError: error => {
							setFileStates(prev =>
								prev.map(item =>
									item.file === file ? { ...item, status: "error", error: error.message ?? "Upload failed" } : item
								)
							);
						},
					}
				);
			});
		},
		onDropRejected: fileRejections => {
			setOpenDialog(false);
			for (const { file, errors } of fileRejections) {
				for (const error of errors) {
					let message = "One or more files could not be uploaded..";

					switch (error.code) {
						case "file-too-large":
							message = `"${file.name}" exceeds the 100MB size limit.`;
							break;
						case "file-invalid-type":
							message = `"${file.name}" has an unsupported file type.`;
							break;
						case "too-many-files":
							message = `You can only upload up to 5 files at a time.`;
							break;
						default:
							message = `"${file.name}" could not be uploaded.`;
					}
					toast.error(message);
					return;
				}
			}
		},
		onError: error => {
			setOpenDialog(false);
			toast.error(error.message ?? "One or more files could not be uploaded.");
		},
	});

	return (
		<div
			{...getRootProps({
				className: cn(
					"flex h-full items-start justify-center rounded-2xl transition-all",
					isDragActive && "border-3 border-blue-500 bg-blue-500/20"
				),
			})}
		>
			<AnimatePresence>
				{isDragActive && (
					<motion.div
						initial={{ opacity: 0, scale: 0.8, y: 20, filter: "blur(10px)" }}
						animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
						exit={{ opacity: 0, scale: 0.8, y: 20, filter: "blur(10px)" }}
						className="absolute inset-2 flex flex-col items-center justify-center gap-2"
					>
						<CloudUpload className="size-24" />
						<p className="text-sm font-semibold select-none">Drop files here to upload</p>
					</motion.div>
				)}
			</AnimatePresence>
			<Drawer open={openDialog} onClose={() => setOpenDialog(false)}>
				<DrawerContent className="bg-card mx-auto mb-4 max-w-sm">
					<DrawerHeader className="flex items-start justify-between">
						<DrawerTitle className="flex w-full items-center justify-between gap-2">
							{`Uploading ${acceptedFiles.length} files`}
						</DrawerTitle>
						<DrawerDescription>This may take a while</DrawerDescription>
					</DrawerHeader>
					{Object.entries(fileStates).map(([id, { file, status }]) => (
						<div key={id} className="flex items-center justify-between border-b px-2">
							<div className="flex items-center gap-2 py-2">
								<div className="flex-shrink-0 text-sm font-medium">{getModernFileIcon(file.type, file.name)}</div>
								<span>{file.name}</span>
							</div>
							<div>
								{status === "uploading" && <RefreshCcw className="h-4 w-4 animate-spin text-blue-500" />}
								{status === "error" && <CircleAlert className="h-4 w-4 text-red-500" />}
								{status === "success" && <CircleCheckBig className="h-4 w-4 text-green-500" />}
							</div>
						</div>
					))}
				</DrawerContent>
			</Drawer>
			{children}
		</div>
	);
}

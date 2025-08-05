"use client";

import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { CircleAlert, CircleCheckBig, CloudUpload, RefreshCcw } from "lucide-react";
import { uploadMutationKey, useUploadFile } from "@/hooks/useFileOperations";
import { useMutationState, type MutationState } from "@tanstack/react-query";
import { MAX_FILE_SIZE, type UploadFileSchema } from "@nimbus/shared";
import { AnimatePresence, motion } from "motion/react";
import { useSearchParams } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { getModernFileIcon } from ".";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";

export default function DragNDropUploader({ children }: { children: React.ReactNode }) {
	const { mutate: uploadFile } = useUploadFile();

	const [openDialog, setOpenDialog] = useState(false);

	const searchParams = useSearchParams();
	const parentId = searchParams.get("folderId") ?? "root";

	const { getRootProps, isDragActive, acceptedFiles } = useDropzone({
		multiple: true,
		noClick: true,
		noKeyboard: true,
		noDragEventsBubbling: true,
		maxFiles: 5,
		maxSize: MAX_FILE_SIZE,
		onDropAccepted: files => {
			setOpenDialog(true);
			files.forEach(file => {
				uploadFile({ file, parentId });
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

	const fileUploadState: MutationState<unknown, Error, UploadFileSchema>[] = useMutationState({
		filters: { mutationKey: uploadMutationKey, exact: true },
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
				<DrawerContent className="bg-card mx-auto mb-4 max-w-sm p-0">
					<DrawerHeader className="flex items-start justify-between p-4">
						<DrawerTitle className="flex w-full items-center justify-between gap-2">
							{`Uploading ${acceptedFiles.length} files`}
						</DrawerTitle>
						<DrawerDescription>This may take a while</DrawerDescription>
					</DrawerHeader>
					<div className="scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar scrollbar-thumb-accent/70 scrollbar-track-transparent scrollbar-hover:scrollbar-thumb-accent scrollbar-w-2 scrollbar-h-2 max-h-[500px] overflow-y-scroll">
						{fileUploadState.map(({ status, variables }, idx) => (
							<div key={idx} className="flex items-center justify-between border-b px-2">
								<div className="flex items-center gap-2 py-2">
									<div className="flex-shrink-0 text-sm font-medium">
										{getModernFileIcon(variables?.file?.type, variables?.file?.name)}
									</div>
									<span>{variables?.file.name}</span>
								</div>
								<div>
									{status === "pending" && <RefreshCcw className="h-4 w-4 animate-spin text-blue-500" />}
									{status === "error" && <CircleAlert className="h-4 w-4 text-red-500" />}
									{status === "success" && <CircleCheckBig className="h-4 w-4 text-green-500" />}
								</div>
							</div>
						))}
					</div>
				</DrawerContent>
			</Drawer>
			{children}
		</div>
	);
}

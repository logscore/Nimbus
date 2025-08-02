"use client";

import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import { useUploadFile } from "@/hooks/useFileOperations";
import { AnimatePresence, motion } from "motion/react";
import { CloudUpload, Cross, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { getModernFileIcon } from ".";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function DragNDropUploader({ children }: { children: React.ReactNode }) {
	const { mutate: uploadFile, isPending } = useUploadFile();

	const searchParams = useSearchParams();
	const parentId = searchParams.get("folderId") ?? "root";

	const { getRootProps, isDragActive, acceptedFiles } = useDropzone({
		// accept: { "image/png": [".png"], "text/html": [".html", ".htm"] }, // TODO: Find the list of accepted MIME types and extensions
		multiple: true,
		noClick: true,
		noKeyboard: true,
		noDragEventsBubbling: true,
		maxFiles: 2,
		maxSize: 1024 * 1 * 1024 * 5, // 5MB
		onDropAccepted: files => {
			files.forEach(file => {
				uploadFile(
					{
						file,
						parentId,
					},
					{
						onSuccess: () => {
							toast.success(`Successfully uploaded ${files.length} ${files.length === 1 ? "file" : "files"}`);
						},
						onError: error => {
							console.error("Upload error:", error);
							toast.error(error.message ?? "Failed to upload file");
						},
					}
				);
			});
		},
		onDropRejected: (fileRejections, error) => {
			fileRejections.forEach(fileRejection => {
				toast.error(fileRejection.errors.map(error => error.message).join(", "));
			});
		},
		onError: error => {
			toast.error(error.message ?? "Failed to upload file");
		},
	});

	const files = [
		{
			path: "/original-1x1.webp",
			relativePath: "/original-1x1.webp",
			lastModified: 1679683200000,
			lastModifiedDate: new Date(1679683200000),
			name: "original-1x1.webp",
			size: 1024,
			type: "image/webp",
		},
		{
			path: "/original-1x1.webp",
			relativePath: "/original-1x1.webp",
			lastModified: 1679683200000,
			lastModifiedDate: new Date(1679683200000),
			name: "original-1x1.webp",
			size: 1024,
			type: "image/webp",
		},
		{
			path: "/original-1x1.webp",
			relativePath: "/original-1x1.webp",
			lastModified: 1679683200000,
			lastModifiedDate: new Date(1679683200000),
			name: "original-1x1.webp",
			size: 1024,
			type: "image/webp",
		},
		{
			path: "/original-1x1.webp",
			relativePath: "/original-1x1.webp",
			lastModified: 1679683200000,
			lastModifiedDate: new Date(1679683200000),
			name: "original-1x1.webp",
			size: 1024,
			type: "image/webp",
		},
	];

	return (
		<div
			{...getRootProps({
				className: cn(
					"flex flex-1 items-start justify-center rounded-2xl transition-all",
					isDragActive && "border-3 border-blue-500 bg-blue-500/20"
				),
			})}
		>
			<AnimatePresence>
				{isDragActive && (
					<div className="absolute inset-0 transition-colors">
						<motion.div
							initial={{ opacity: 0, scale: 0.8, y: 20, filter: "blur(10px)" }}
							animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
							exit={{ opacity: 0, scale: 0.8, y: 20, filter: "blur(10px)" }}
							className="flex flex-col items-center justify-center gap-2 p-2"
						>
							<CloudUpload className="size-24" />
							<p className="mt-2 text-sm font-semibold select-none">Drop files here to upload</p>
						</motion.div>
					</div>
				)}
			</AnimatePresence>

			<Drawer open={isPending}>
				<DrawerContent className="bg-card mx-auto max-w-sm">
					<DrawerHeader className="flex items-start justify-between">
						<DrawerTitle className="flex w-full items-center justify-between gap-2">
							<span>{`Uploading ${acceptedFiles.length} files`}</span> <X />
						</DrawerTitle>
						<DrawerDescription>This may take a while</DrawerDescription>
					</DrawerHeader>
					<div className="flex flex-col gap-2 px-2">
						{files.map((file, index) => (
							<div key={index} className="flex items-center justify-between">
								<div className="flex items-center gap-2 p-2">
									<div className="flex-shrink-0 text-sm font-medium">{getModernFileIcon(file.type, file.name)}</div>
									<span>{file.name}</span>
								</div>
							</div>
						))}
					</div>
					<DrawerFooter className="bg-card mx-auto max-w-sm"></DrawerFooter>
				</DrawerContent>
			</Drawer>

			{children}
		</div>
	);
}

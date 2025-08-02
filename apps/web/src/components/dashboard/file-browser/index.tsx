"use client";

import {
	Archive,
	ChevronDown,
	ChevronUp,
	CloudUpload,
	Code,
	FileIcon,
	FileSpreadsheet,
	FileText,
	Folder,
	ImageIcon,
	Loader2,
	Music,
	Presentation,
	Video,
} from "lucide-react";
import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
	type Row,
	type SortingState,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ALLOWED_MIME_TYPES, formatFileSize } from "@nimbus/shared";
import { useRouter, useSearchParams } from "next/navigation";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import React, { useMemo, useState, type JSX } from "react";
import { UploadButton } from "@/components/upload-button";
import { useUploadFile } from "@/hooks/useFileOperations";
import { ScrollArea } from "@/components/ui/scroll-area";
import DragNDropUploader from "./drag-n-drop-uploader";
import { AnimatePresence, motion } from "motion/react";
import { Logo, PdfIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useDropzone } from "react-dropzone";
import { FileActions } from "./file-actions";
import type { File } from "@nimbus/shared";
import { useTags } from "@/hooks/useTags";
import { FileTags } from "./file-tags";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Utility function for date formatting
const formatDate = (dateString: string | null): string => {
	if (!dateString) return "—";

	const date = new Date(dateString);
	const now = new Date();
	const diffInMs = now.getTime() - date.getTime();
	const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
	const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

	// Less than 1 hour: show minutes
	if (diffInHours < 1) {
		if (diffInMinutes < 1) {
			return "just now";
		}
		return `${diffInMinutes} min ago`;
	}

	// Less than 24 hours: show hours
	if (diffInHours < 24) {
		return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
	}

	// 24 hours or more: show full date
	return format(date, "MMM d, yyyy");
};

interface FileTableProps {
	files: File[];
	isLoading: boolean;
	refetch: () => void;
	error: Error | null;
}

const columnHelper = createColumnHelper<File>();

export function FileTable({ files, isLoading, refetch, error }: FileTableProps) {
	const { tags } = useTags(files[0]?.parentId);
	const router = useRouter();
	const searchParams = useSearchParams();
	const [sorting, setSorting] = useState<SortingState>([]);

	const [filteredFiles, setFilteredFiles] = useState<File[]>([]);
	const searchType = searchParams.get("type");

	const safeFiles = useMemo(() => {
		if (isLoading || !files || !Array.isArray(files)) {
			return [];
		}

		let result = [...files];

		// Apply type filter if specified
		if (searchType) {
			result = result.filter(file => {
				const mimeType = file.mimeType?.toLowerCase() ?? "";
				const fileName = file.name?.toLowerCase() ?? "";

				switch (searchType) {
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

		setFilteredFiles(result);
		return result;
	}, [files, isLoading, searchType]);

	const handleRowDoubleClick = (file: File): void => {
		const fileType = file.mimeType.includes("folder") || file.mimeType === "folder" ? "folder" : "file";

		if (fileType === "folder") {
			const params = new URLSearchParams(searchParams);
			params.set("folderId", file.id);
			router.push(`?${params.toString()}`);
		}
	};

	const columns = useMemo(
		() => [
			columnHelper.accessor("name", {
				header: ({ column }) => (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="h-8 w-full justify-start px-1 text-left text-neutral-500 hover:text-neutral-900 has-[>svg]:px-0 dark:text-neutral-500 dark:hover:bg-transparent dark:hover:text-neutral-300"
					>
						Name
						<div className="w-6">
							{column.getIsSorted() === "asc" && <ChevronUp className="w-6" />}
							{column.getIsSorted() === "desc" && <ChevronDown className="w-6" />}
						</div>
					</Button>
				),
				cell: ({ getValue, row }) => (
					<div className="flex items-center gap-2 pl-1">
						<div className="flex-shrink-0">{getModernFileIcon(row.original.mimeType, row.original.name)}</div>
						<span>{getValue()}</span>
					</div>
				),
			}),

			columnHelper.accessor("modifiedTime", {
				header: ({ column }) => (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="h-8 w-full justify-start px-1 text-left text-neutral-500 hover:text-neutral-900 has-[>svg]:px-0 dark:text-neutral-500 dark:hover:bg-transparent dark:hover:text-neutral-300"
					>
						Date Modified
						<div className="w-6">
							{column.getIsSorted() === "asc" && <ChevronUp className="w-6" />}
							{column.getIsSorted() === "desc" && <ChevronDown className="w-6" />}
						</div>
					</Button>
				),
				cell: ({ getValue }) => <div className="pl-1">{formatDate(getValue())}</div>,
				sortingFn: (rowA, rowB) => {
					const a = rowA.original.modifiedTime;
					const b = rowB.original.modifiedTime;
					if (!a && !b) return 0;
					if (!a) return 1;
					if (!b) return -1;
					return new Date(a).getTime() - new Date(b).getTime();
				},
				size: 125,
				maxSize: 125,
				minSize: 125,
			}),

			// columnHelper.display({
			// 	id: "owner",
			// 	header: ({ column }) => (
			// 		<Button
			// 			variant="ghost"
			// 			onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
			// 			className="h-8 w-full justify-start px-0 text-left text-neutral-500 hover:text-neutral-300 has-[>svg]:px-0 dark:hover:bg-transparent"
			// 		>
			// 			Owner
			// 			<div className="w-6">
			// 				{column.getIsSorted() === "asc" && <ChevronUp className="w-6" />}
			// 				{column.getIsSorted() === "desc" && <ChevronDown className="w-6" />}
			// 			</div>
			// 		</Button>
			// 	),
			// 	cell: () => <div className="text-neutral-600 dark:text-neutral-400">You</div>,
			// }),

			columnHelper.accessor("size", {
				header: ({ column }) => (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="h-8 w-full justify-start px-1 text-left text-neutral-500 hover:text-neutral-900 has-[>svg]:px-0 dark:text-neutral-500 dark:hover:bg-transparent dark:hover:text-neutral-300"
					>
						Size
						<div className="w-6">
							{column.getIsSorted() === "asc" && <ChevronUp className="w-6" />}
							{column.getIsSorted() === "desc" && <ChevronDown className="w-6" />}
						</div>
					</Button>
				),
				cell: ({ getValue }) => <div className="pl-1">{formatFileSize(Number(getValue()))}</div>,
				size: 125,
				maxSize: 125,
				minSize: 125,
			}),

			columnHelper.accessor("tags", {
				header: ({ column }) => (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="h-8 w-full justify-start px-1 text-left text-neutral-500 hover:text-neutral-900 has-[>svg]:px-0 dark:text-neutral-500 dark:hover:bg-transparent dark:hover:text-neutral-300"
					>
						Tags
						<div className="w-6">
							{column.getIsSorted() === "asc" && <ChevronUp className="w-6" />}
							{column.getIsSorted() === "desc" && <ChevronDown className="w-6" />}
						</div>
					</Button>
				),
				cell: ({ row }) => <FileTags file={row.original} availableTags={tags} refetch={refetch} />,
				size: 150,
				maxSize: 150,
				minSize: 150,
			}),

			columnHelper.display({
				id: "actions",
				header: "",
				cell: ({ row }) => {
					const file = row.original;
					const fileType = file.mimeType.includes("folder") || file.mimeType === "folder" ? "folder" : "file";

					return <FileActions file={row.original} fileType={fileType} />;
				},
				size: 50,
				maxSize: 50,
				minSize: 50,
			}),
		],
		[refetch, tags]
	);

	// <<<<<<< HEAD
	const table = useReactTable({
		data: searchType ? filteredFiles : safeFiles,
		columns,
		state: {
			sorting,
		},
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});
	// =======
	// // Local state for optimistic updates
	// const [localFiles, setLocalFiles] = useState<_File[]>([]);
	// const [originalFiles, setOriginalFiles] = useState<_File[]>([]);

	// // Update local state when server data changes
	// useEffect(() => {
	// 	if (data) {
	// 		let filteredFiles = [...data];

	// 		if (type) {
	// 			filteredFiles = data.filter((file: _File) => {
	// 				const mimeType = file.mimeType?.toLowerCase() ?? "";
	// 				const fileName = file.name?.toLowerCase() ?? "";

	// 				switch (type) {
	// 					case "folder":
	// 						return mimeType === "application/vnd.google-apps.folder" || mimeType === "folder";
	// 					case "document":
	// 						return (
	// 							// Google Docs
	// 							mimeType.includes("application/vnd.google-apps.document") ||
	// 							mimeType.includes("application/vnd.google-apps.spreadsheet") ||
	// 							mimeType.includes("application/vnd.google-apps.presentation") ||
	// 							// Microsoft Office
	// 							mimeType.includes("officedocument") ||
	// 							mimeType.includes("msword") ||
	// 							// PDFs
	// 							mimeType.includes("pdf") ||
	// 							// Text files
	// 							mimeType.includes("text/") ||
	// 							// Common document extensions
	// 							/\.(doc|docx|xls|xlsx|ppt|pptx|pdf|txt|rtf|odt|ods|odp)$/i.test(fileName)
	// 						);
	// 					case "media":
	// 						return (
	// 							// Images
	// 							mimeType.includes("image/") ||
	// 							// Videos
	// 							mimeType.includes("video/") ||
	// 							// Audio
	// 							mimeType.includes("audio/") ||
	// 							// Common media extensions
	// 							/\.(jpg|jpeg|png|gif|bmp|webp|mp4|webm|mov|mp3|wav|ogg)$/i.test(fileName)
	// 						);
	// 					default:
	// 						return true;
	// 				}
	// 			});
	// 		}

	// 		setLocalFiles(filteredFiles);
	// 		setOriginalFiles(data);
	// 	}
	// }, [data, type]);

	// // Optimistic delete handler
	// const handleOptimisticDelete = (fileId: string) => {
	// 	setLocalFiles(prev => prev.filter(file => file.id !== fileId));
	// };

	// // Optimistic rename handler
	// const handleOptimisticRename = (fileId: string, newName: string) => {
	// 	setLocalFiles(prev => prev.map(file => (file.id === fileId ? { ...file, name: newName } : file)));
	// };

	// // Rollback handler for errors
	// const handleRollback = () => {
	// 	setLocalFiles(originalFiles);
	// };
	// >>>>>>> 2701b21e7ec8ce9d8d0dd3dc407f7040bf5ad2e6

	return (
		<div className="relative flex h-full w-full flex-col justify-start">
			<DragNDropUploader>
				{/* h-0 is required to make the table scrollable */}
				<div className="scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar scrollbar-thumb-accent/70 scrollbar-track-transparent scrollbar-hover:scrollbar-thumb-accent scrollbar-w-2 scrollbar-h-2 h-0 min-h-full w-full overflow-auto overflow-y-scroll pb-5">
					<Table>
						<TableHeader className="hover:bg-transparent">
							{table.getHeaderGroups().map(headerGroup => (
								<TableRow key={headerGroup.id} className="h-6 hover:bg-transparent">
									{headerGroup.headers.map(header => (
										<TableHead
											key={header.id}
											className="whitespace-nowrap"
											style={{
												width:
													header.id === "tags" || header.id === "size" || header.id === "modifiedTime"
														? `${header.getSize()}px`
														: undefined,
											}}
										>
											{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
										</TableHead>
									))}
								</TableRow>
							))}
						</TableHeader>
						{error ? (
							<TableBody>
								<TableRow className="hover:bg-transparent">
									<TableCell colSpan={columns.length} className="h-[600px]">
										<div className="flex h-full flex-col items-center justify-center gap-3">
											<h3>An error occured when getting your files. Please try again</h3>
											<Button variant="outline" onClick={refetch}>
												Try again
											</Button>
										</div>
									</TableCell>
								</TableRow>
							</TableBody>
						) : isLoading ? (
							<TableBody>
								<TableRow className="hover:bg-transparent">
									<TableCell colSpan={columns.length} className="h-[600px]">
										<div className="flex h-full flex-col items-center justify-center gap-2">
											<Loader2 className="h-6 w-6 animate-spin" />
											<p>Loading files</p>
										</div>
									</TableCell>
								</TableRow>
							</TableBody>
						) : table.getRowModel().rows.length === 0 ? (
							<TableBody>
								<TableRow className="hover:bg-transparent">
									<TableCell colSpan={columns.length} className="h-[600px]">
										<div className="flex h-full flex-col items-center justify-center gap-2">
											<p>No files found. Lets add one!</p>
											<UploadButton name="Add File" />
										</div>
									</TableCell>
								</TableRow>
							</TableBody>
						) : (
							<TableBody className="border-spacing-2">
								{table.getRowModel().rows.map(row => (
									<DroppableTableRow key={row.id} row={row} handleRowDoubleClick={handleRowDoubleClick} />
								))}
							</TableBody>
						)}
					</Table>
				</div>
			</DragNDropUploader>
		</div>
	);
}

function DroppableTableRow({
	row,
	handleRowDoubleClick,
}: {
	row: Row<File>;
	handleRowDoubleClick: (file: File) => void;
}) {
	const { isOver, setNodeRef: droppableRef } = useDroppable({
		id: `droppable-${row.id}`,
		data: row.original,
	});

	const {
		attributes,
		listeners,
		setNodeRef: draggableRef,
		transform,
	} = useDraggable({
		id: `draggable-${row.id}`,
		data: row.original,
	});

	const style = {
		...(transform && {
			transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
			transition: "transform 0.1s ease",
		}),
	};

	const isFolder = row.original.type === "folder";

	return (
		<TableRow
			className={cn(
				"h-8 rounded-md transition-all hover:bg-transparent",
				(isOver || transform) && "z-[100] scale-x-90 rounded-md bg-blue-500/20 text-blue-500 ring-2 ring-blue-500",
				isOver && "scale-x-95",
				transform && "scale-95"
			)}
			onDoubleClick={() => handleRowDoubleClick(row.original)}
			ref={node => {
				if (isFolder) {
					droppableRef(node);
				}
				draggableRef(node);
			}}
			style={style}
			{...listeners}
			{...attributes}
		>
			{row.getVisibleCells().map(cell => (
				<TableCell
					key={cell.id}
					className="h-10 py-0 whitespace-nowrap"
					style={{
						width: cell.column.id === "tags" || cell.column.id === "actions" ? "50px" : undefined,
					}}
				>
					{flexRender(cell.column.columnDef.cell, cell.getContext())}
				</TableCell>
			))}
		</TableRow>
	);
}

export default DroppableTableRow;

/**
 * Get modern Lucide React icon for file type
 */
export function getModernFileIcon(mimeType?: string, filename?: string) {
	if (!mimeType) {
		if (filename) {
			const ext = filename.split(".").pop()?.toLowerCase();
			return getIconByExtension(ext || "");
		}
		return <FileText className="h-4 w-4 text-blue-500" />;
	}

	// Folder
	if (mimeType.includes("folder")) {
		return <Folder className="h-4 w-4 text-blue-500" />;
	}

	// Images
	if (mimeType.startsWith("image/")) {
		return <ImageIcon className="h-4 w-4 text-green-500" />;
	}

	// Videos
	if (mimeType.startsWith("video/")) {
		return <Video className="h-4 w-4 text-red-500" />;
	}

	// Audio
	if (mimeType.startsWith("audio/")) {
		return <Music className="h-4 w-4 text-purple-500" />;
	}

	// Google Workspace files
	if (mimeType === "application/vnd.google-apps.document") {
		return <FileText className="h-4 w-4 text-blue-600" />;
	}
	if (mimeType === "application/vnd.google-apps.spreadsheet") {
		return <FileSpreadsheet className="h-4 w-4 text-green-600" />;
	}
	if (mimeType === "application/vnd.google-apps.presentation") {
		return <Presentation className="h-4 w-4 text-orange-500" />;
	}

	// Archive files
	if (isArchiveFile(mimeType)) {
		return <Archive className="h-4 w-4 text-yellow-600" />;
	}

	// Code files
	if (isCodeFile(mimeType, filename)) {
		return <Code className="h-4 w-4 text-green-600" />;
	}

	// Office documents
	if (isOfficeFile(mimeType)) {
		return <FileText className="h-4 w-4 text-blue-500" />;
	}

	// PDF
	if (mimeType === "application/pdf") {
		return <PdfIcon className="h-4 w-4" />;
	}

	// Text files
	if (mimeType.startsWith("text/")) {
		return <FileText className="h-4 w-4 text-gray-600" />;
	}

	// Default
	return <FileIcon className="h-4 w-4 text-gray-500" />;
}

/**
 * Get icon by file extension (fallback method)
 */
function getIconByExtension(extension: string) {
	const iconMap: Record<string, JSX.Element> = {
		// Images
		jpg: <ImageIcon className="h-4 w-4 text-green-500" />,
		jpeg: <ImageIcon className="h-4 w-4 text-green-500" />,
		png: <ImageIcon className="h-4 w-4 text-green-500" />,
		gif: <ImageIcon className="h-4 w-4 text-green-500" />,
		svg: <ImageIcon className="h-4 w-4 text-green-500" />,
		webp: <ImageIcon className="h-4 w-4 text-green-500" />,
		// Videos
		mp4: <Video className="h-4 w-4 text-red-500" />,
		avi: <Video className="h-4 w-4 text-red-500" />,
		mov: <Video className="h-4 w-4 text-red-500" />,
		mkv: <Video className="h-4 w-4 text-red-500" />,
		webm: <Video className="h-4 w-4 text-red-500" />,
		// Audio
		mp3: <Music className="h-4 w-4 text-purple-500" />,
		wav: <Music className="h-4 w-4 text-purple-500" />,
		flac: <Music className="h-4 w-4 text-purple-500" />,
		aac: <Music className="h-4 w-4 text-purple-500" />,
		// Documents
		pdf: <PdfIcon className="h-4 w-4" />,
		doc: <FileText className="h-4 w-4 text-blue-500" />,
		docx: <FileText className="h-4 w-4 text-blue-500" />,
		txt: <FileText className="h-4 w-4 text-gray-600" />,
		// Spreadsheets
		xls: <FileSpreadsheet className="h-4 w-4 text-green-600" />,
		xlsx: <FileSpreadsheet className="h-4 w-4 text-green-600" />,
		csv: <FileSpreadsheet className="h-4 w-4 text-green-600" />,
		// Presentations
		ppt: <Presentation className="h-4 w-4 text-orange-500" />,
		pptx: <Presentation className="h-4 w-4 text-orange-500" />,
		// Code
		js: <Code className="h-4 w-4 text-yellow-500" />,
		ts: <Code className="h-4 w-4 text-blue-600" />,
		jsx: <Code className="h-4 w-4 text-cyan-500" />,
		tsx: <Code className="h-4 w-4 text-cyan-600" />,
		html: <Code className="h-4 w-4 text-orange-600" />,
		css: <Code className="h-4 w-4 text-blue-400" />,
		py: <Code className="h-4 w-4 text-yellow-600" />,
		java: <Code className="h-4 w-4 text-red-600" />,
		cpp: <Code className="h-4 w-4 text-blue-700" />,
		c: <Code className="h-4 w-4 text-blue-700" />,
		// Archives
		zip: <Archive className="h-4 w-4 text-yellow-600" />,
		rar: <Archive className="h-4 w-4 text-yellow-600" />,
		"7z": <Archive className="h-4 w-4 text-yellow-600" />,
		tar: <Archive className="h-4 w-4 text-yellow-600" />,
		gz: <Archive className="h-4 w-4 text-yellow-600" />,
	};

	return iconMap[extension] || <FileIcon className="h-4 w-4 text-gray-500" />;
}

// Helper functions for file type detection
function isCodeFile(mimeType: string, filename?: string): boolean {
	const codeTypes = [
		"text/javascript",
		"application/javascript",
		"text/html",
		"text/css",
		"application/json",
		"text/xml",
		"application/xml",
	];

	if (codeTypes.includes(mimeType)) {
		return true;
	}

	if (filename) {
		const ext = filename.split(".").pop()?.toLowerCase();
		const codeExtensions = [
			"js",
			"ts",
			"jsx",
			"tsx",
			"html",
			"css",
			"json",
			"xml",
			"py",
			"java",
			"cpp",
			"c",
			"cs",
			"php",
			"rb",
			"go",
			"rs",
			"swift",
			"kt",
			"dart",
		];
		return codeExtensions.includes(ext || "");
	}

	return false;
}

function isOfficeFile(mimeType: string): boolean {
	const officeTypes = [
		"application/msword",
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		"application/vnd.ms-excel",
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		"application/vnd.ms-powerpoint",
		"application/vnd.openxmlformats-officedocument.presentationml.presentation",
	];
	return officeTypes.includes(mimeType);
}

function isArchiveFile(mimeType: string): boolean {
	const archiveTypes = [
		"application/zip",
		"application/x-rar-compressed",
		"application/x-7z-compressed",
		"application/x-tar",
		"application/gzip",
	];
	return archiveTypes.includes(mimeType);
}

"use client";

import {
	ChevronUp,
	ChevronDown,
	Loader2,
	Folder,
	FileText,
	ImageIcon,
	Video,
	Music,
	FileSpreadsheet,
	Presentation,
	Archive,
	Code,
	FileIcon,
} from "lucide-react";
import {
	useReactTable,
	getCoreRowModel,
	getSortedRowModel,
	createColumnHelper,
	flexRender,
	type SortingState,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useMemo, useState, type JSX } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatFileSize } from "@/lib/file-utils";
import { Button } from "@/components/ui/button";
import { PdfIcon } from "@/components/icons";
import { FileActions } from "./file-actions";
import type { File } from "@nimbus/shared";
import { useTags } from "@/hooks/useTags";
import { FileTags } from "./file-tags";
import { format } from "date-fns";

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

	const safeFiles = useMemo(() => {
		if (isLoading || !files || !Array.isArray(files)) {
			return [];
		}
		return files;
	}, [files, isLoading]);

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

	const table = useReactTable({
		data: safeFiles,
		columns,
		state: {
			sorting,
		},
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	return (
		<div className="flex flex-1 flex-col justify-end">
			<ScrollArea className="h-[740px] w-full px-2">
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
					) : (
						<TableBody>
							{table.getRowModel()?.rows.length === 0 ? (
								<TableRow className="h-8 hover:bg-transparent">
									<TableCell colSpan={columns.length} className="py-0">
										No files found
									</TableCell>
								</TableRow>
							) : (
								table.getRowModel().rows.map(row => (
									<TableRow
										key={row.id}
										className="h-8 hover:bg-transparent"
										onDoubleClick={() => handleRowDoubleClick(row.original)}
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
								))
							)}
						</TableBody>
					)}
				</Table>
			</ScrollArea>
		</div>
	);
}

/**
 * Get modern Lucide React icon for file type
 */
function getModernFileIcon(mimeType?: string, filename?: string) {
	if (!mimeType) {
		if (filename) {
			const ext = filename.split(".").pop()?.toLowerCase();
			return getIconByExtension(ext || "");
		}
		return <FileText className="h-4 w-4 text-blue-500" />;
	}

	// Folder
	if (mimeType === "application/vnd.google-apps.folder") {
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

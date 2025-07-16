"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, Filter, Folder, Search, Tag as TagIcon, Loader2 } from "lucide-react";
import { FileTags } from "@/components/dashboard/file-browser/file-tags";
import { useSearchFiles } from "@/hooks/useFileOperations";
import { Card, CardContent } from "@/components/ui/card";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { _File, Tag } from "@/lib/types";
import { useState, useEffect } from "react";
import type { KeyboardEvent } from "react";
import { useTags } from "@/hooks/useTags";
import { toast } from "sonner";

interface SearchDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

/**
 * SearchDialog Component - Advanced File Search with Tag Support
 *
 * TAG SEARCH FUNCTIONALITY:
 *
 * 1. Basic Tag Search:
 *    - "tag:important" - finds files tagged with "important"
 *    - "tag:work" - finds files tagged with "work"
 *    - Supports partial matching: "tag:imp" will match "important"
 *
 * 2. Multiple Tags (OR operation - default):
 *    - "tag:important tag:work" - finds files with EITHER "important" OR "work" tags
 *
 * 3. Multiple Tags (AND operation):
 *    - "+tag:important +tag:work" - finds files with BOTH "important" AND "work" tags
 *
 * 4. Combined Search:
 *    - "tag:important financial report" - finds files tagged "important" AND containing "financial report" in name
 *    - "type:pdf tag:important" - finds PDFs that are tagged "important"
 *
 * 5. File Type Search:
 *    - "type:pdf" - finds PDF files
 *    - "type:spreadsheet" - finds spreadsheet files
 *    - "type:presentation" - finds presentation files
 *
 * The search interface provides:
 * - Dynamic tag suggestions based on most popular tags
 * - Visual tag indicators with colors and file counts
 * - Quick access buttons for common searches
 * - Real-time search with debouncing
 */

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
	const [query, setQuery] = useState("");
	const [searchResults, setSearchResults] = useState<_File[]>([]);
	const [selectedFile, setSelectedFile] = useState<string | null>(null);
	const [extractedKeywords, setExtractedKeywords] = useState<string[]>([]);
	const [hasSearched, setHasSearched] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");

	const queryClient = useQueryClient();

	// Use only the Files endpoint for Google Drive search
	const {
		data: searchData,
		isLoading,
		error,
		refetch,
	} = useSearchFiles(
		searchQuery,
		30,
		["id", "name", "mimeType", "size", "modificationDate", "webContentLink", "webViewLink"],
		undefined
	);

	const { tags } = useTags();

	// Helper function to flatten hierarchical tag structure for suggestions
	const flattenTags = (tags: Tag[]): Tag[] => {
		const flattened: Tag[] = [];
		const flattenRecursive = (tagList: Tag[]) => {
			tagList.forEach(tag => {
				flattened.push(tag);
				if (tag.children && tag.children.length > 0) {
					flattenRecursive(tag.children);
				}
			});
		};
		flattenRecursive(tags || []);
		return flattened;
	};

	// Get popular tags (tags with most files)
	const getPopularTags = () => {
		const flatTags = flattenTags(tags || []);
		return flatTags
			.filter(tag => (tag._count || 0) > 0)
			.sort((a, b) => (b._count || 0) - (a._count || 0))
			.slice(0, 5);
	};

	useEffect(() => {
		if (open) {
			setQuery("");
			setSearchResults([]);
			setSelectedFile(null);
			setExtractedKeywords([]);
			setHasSearched(false);
			setSearchQuery("");
		}
	}, [open]);

	useEffect(() => {
		if (searchData?.files) {
			setSearchResults(searchData.files);
		}
	}, [searchData]);

	useEffect(() => {
		if (error) {
			toast.error("Failed to search files. Please try again.");
		}
	}, [error]);

	const handleSearch = async (searchQuery?: string) => {
		const queryToSearch = searchQuery || query;
		if (!queryToSearch.trim()) {
			setSearchResults([]);
			setExtractedKeywords([]);
			setHasSearched(false);
			setSearchQuery("");
			return;
		}

		setSearchQuery(queryToSearch);
		setExtractedKeywords(
			queryToSearch
				.toLowerCase()
				.split(/\s+/)
				.filter(word => word.length > 2)
		);
		setHasSearched(true);
	};

	const handleKeyPress = (e: KeyboardEvent) => {
		if (e.key === "Enter") {
			void handleSearch();
		}
	};

	const handleSuggestionClick = (suggestionQuery: string) => {
		setQuery(suggestionQuery);
		void handleSearch(suggestionQuery);
	};

	const toggleFileSelection = (fileId: string) => {
		setSelectedFile(prev => (prev === fileId ? null : fileId));
	};

	const handleRefetch = () => {
		void refetch();
		void queryClient.invalidateQueries({ queryKey: ["tags"] });
	};

	const getFileIcon = (mimeType: string) => {
		if (mimeType.includes("folder") || mimeType === "application/vnd.google-apps.folder") {
			return <Folder className="h-4 w-4 text-blue-500" />;
		}
		if (mimeType.includes("spreadsheet") || mimeType.includes("sheet")) {
			return <FileText className="h-4 w-4 text-green-500" />;
		}
		if (mimeType.includes("presentation") || mimeType.includes("slides")) {
			return <FileText className="h-4 w-4 text-orange-500" />;
		}
		return <FileText className="h-4 w-4 text-gray-500" />;
	};

	const formatFileSize = (size: string | null) => {
		if (!size) return "Unknown size";
		const bytes = parseInt(size);
		if (isNaN(bytes)) return size;

		const units = ["B", "KB", "MB", "GB"];
		let unitIndex = 0;
		let fileSize = bytes;

		while (fileSize >= 1024 && unitIndex < units.length - 1) {
			fileSize /= 1024;
			unitIndex++;
		}

		return `${fileSize.toFixed(1)} ${units[unitIndex]}`;
	};

	const formatDate = (dateString: string | null) => {
		if (!dateString) return "Unknown date";
		try {
			return new Date(dateString).toLocaleDateString();
		} catch {
			return "Invalid date";
		}
	};

	const getFileType = (mimeType: string) => {
		if (mimeType.includes("folder")) return "folder";
		if (mimeType.includes("spreadsheet") || mimeType.includes("sheet")) return "spreadsheet";
		if (mimeType.includes("presentation") || mimeType.includes("slides")) return "presentation";
		if (mimeType.includes("document") || mimeType.includes("text")) return "document";
		return "file";
	};

	// Reset when dialog closes
	const handleOpenChange = (newOpen: boolean) => {
		if (!newOpen) {
			setQuery("");
			setSearchResults([]);
			setSelectedFile(null);
			setExtractedKeywords([]);
			setHasSearched(false);
			setSearchQuery("");
		}
		onOpenChange(newOpen);
	};

	const popularTags = getPopularTags();

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="flex h-[90vh] max-h-[90vh] flex-col p-0 sm:max-w-[850px] lg:max-w-4xl">
				<DialogHeader className="border-b p-6">
					<div className="flex items-center justify-between">
						<div>
							<DialogTitle className="flex items-center gap-2">
								<Search className="h-5 w-5 text-blue-500" />
								Google Drive Search
							</DialogTitle>
							<DialogDescription className="mt-1">
								Search files by name, type, or tags. Examples: &quot;type:pdf&quot;, &quot;tag:important&quot;
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				{/* Search Controls */}
				<div className="flex-shrink-0 space-y-2 p-4">
					<div className="flex gap-2">
						<div className="relative flex-1">
							<Search className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
							<Input
								placeholder="Search files... Try: 'meeting notes', 'type:pdf', 'tag:important'"
								value={query}
								onChange={e => setQuery(e.target.value)}
								onKeyDown={handleKeyPress}
								className="pl-10"
								autoFocus
							/>
						</div>
						<Button onClick={() => handleSearch()} disabled={!query.trim() || isLoading}>
							{isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
							{isLoading ? "Searching..." : "Search"}
						</Button>
					</div>

					{/* Quick Search Examples */}
					<div className="flex flex-wrap gap-2">
						<Button variant="outline" size="sm" onClick={() => handleSuggestionClick("type:pdf")}>
							<FileText className="mr-1 h-3 w-3" />
							PDFs
						</Button>

						<Button variant="outline" size="sm" onClick={() => handleSuggestionClick("tag:important")}>
							<TagIcon className="mr-1 h-3 w-3" />
							Important files
						</Button>

						{/* Example of AND operation if we have at least 2 popular tags */}
						{popularTags.length >= 2 && popularTags[0] && popularTags[1] && (
							<Button
								variant="outline"
								size="sm"
								onClick={() => handleSuggestionClick(`+tag:${popularTags[0]!.name} +tag:${popularTags[1]!.name}`)}
								className="gap-1"
							>
								<TagIcon className="h-3 w-3" />
								<span className="text-xs">Both tags</span>
							</Button>
						)}

						{/* Dynamic tag suggestions */}
						{popularTags.map(tag => (
							<Button
								key={tag.id}
								variant="outline"
								size="sm"
								onClick={() => handleSuggestionClick(`tag:${tag.name}`)}
								className="gap-1"
							>
								<div className="h-2 w-2 rounded-full" style={{ backgroundColor: tag.color }} />
								<span className="text-xs">tag:{tag.name}</span>
								{tag._count && tag._count > 0 && (
									<Badge variant="secondary" className="ml-1 h-4 text-xs">
										{tag._count}
									</Badge>
								)}
							</Button>
						))}
					</div>

					{/* Keywords */}
					{extractedKeywords.length > 0 && (
						<div className="mt-2">
							<div className="flex items-center gap-2">
								<Filter className="text-primary h-4 w-4" />
								<span className="text-sm font-medium">Search terms:</span>
							</div>
							<div className="mt-1 flex flex-wrap gap-1">
								{extractedKeywords.map((keyword, index) => (
									<Badge key={index} variant="secondary" className="text-xs">
										{keyword}
									</Badge>
								))}
							</div>
						</div>
					)}
				</div>

				{/* Results */}
				<div className="flex min-h-0 flex-1 flex-col overflow-hidden px-6">
					{isLoading ? (
						<div className="flex flex-1 items-center justify-center py-12">
							<Loader2 className="h-8 w-8 animate-spin text-blue-500" />
						</div>
					) : searchResults.length > 0 ? (
						<div className="flex h-full flex-col">
							<div className="flex flex-shrink-0 items-center justify-between border-b py-3">
								<h3 className="text-lg font-semibold">
									Found {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}
								</h3>
							</div>

							<div className="flex-1 overflow-y-auto px-1 py-4">
								<div className="grid gap-4">
									{searchResults.map(file => (
										<Card
											key={file.id}
											className={`hover:bg-accent/80 cursor-pointer border-0 transition-colors ${
												selectedFile === file.id ? "ring-primary bg-accent/90 ring-2" : ""
											}`}
											onClick={() => toggleFileSelection(file.id)}
										>
											<CardContent className="p-4">
												<div className="flex items-start justify-between">
													<div className="flex flex-1 items-center gap-3">
														{getFileIcon(file.mimeType)}
														<div className="min-w-0 flex-1">
															<h4 className="truncate font-medium">{file.name}</h4>
															<div className="text-muted-foreground flex items-center gap-2 text-sm">
																<span>{formatDate(file.modificationDate)}</span>
																<span>•</span>
																<span>{formatFileSize(file.size)}</span>
																<span>•</span>
																<span className="capitalize">{getFileType(file.mimeType)}</span>
															</div>
														</div>
													</div>
													<div className="ml-4 flex flex-wrap gap-1">
														{tags && <FileTags file={file} availableTags={tags} refetch={handleRefetch} />}
													</div>
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							</div>
						</div>
					) : query?.trim() && hasSearched ? (
						<div className="flex flex-1 items-center justify-center py-12 text-center">
							<div className="text-muted-foreground">
								<Search className="mx-auto mb-4 h-12 w-12 opacity-50" />
								<p className="mb-2 text-lg">No results found</p>
								<p className="text-sm">Try different keywords or check your spelling</p>
							</div>
						</div>
					) : (
						<div className="flex flex-1 items-center justify-center py-12 text-center">
							<div className="text-muted-foreground">
								<Search className="mx-auto mb-4 h-12 w-12 opacity-50" />
								<p className="mb-2 text-lg">Start searching</p>
								<p className="text-sm">Enter keywords to find your files or try the examples above</p>
							</div>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}

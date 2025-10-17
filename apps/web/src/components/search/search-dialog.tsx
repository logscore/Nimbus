import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, Filter, Folder, Search, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { KeyboardEvent } from "react";
import { useState } from "react";

interface SearchResult {
	id: string;
	name: string;
	type: string;
	size: string;
	modified: string;
	keywords: string[];
	tags: { id: string; name: string; color: string }[];
}

interface SearchDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

// Demo data for search results
const DEMO_FILES: SearchResult[] = [
	{
		id: "1",
		name: "Q4_Financial_Report.xlsx",
		type: "spreadsheet",
		size: "2.4 MB",
		modified: "May 10, 2024",
		keywords: ["financial", "report", "q4", "spreadsheet", "billing", "revenue"],
		tags: [
			{ id: "tag1", name: "financial", color: "bg-green-500" },
			{ id: "tag2", name: "important", color: "bg-red-500" },
		],
	},
	{
		id: "2",
		name: "Invoice_Template.xlsx",
		type: "spreadsheet",
		size: "1.2 MB",
		modified: "May 8, 2024",
		keywords: ["invoice", "template", "billing", "spreadsheet", "accounting"],
		tags: [
			{ id: "tag3", name: "billing", color: "bg-blue-500" },
			{ id: "tag4", name: "template", color: "bg-purple-500" },
		],
	},
	{
		id: "3",
		name: "Budget_Planning_2024.xlsx",
		type: "spreadsheet",
		size: "3.1 MB",
		modified: "May 5, 2024",
		keywords: ["budget", "planning", "2024", "spreadsheet", "financial"],
		tags: [
			{ id: "tag1", name: "financial", color: "bg-green-500" },
			{ id: "tag5", name: "planning", color: "bg-yellow-500" },
		],
	},
	{
		id: "4",
		name: "Meeting_Notes.docx",
		type: "document",
		size: "0.8 MB",
		modified: "May 3, 2024",
		keywords: ["meeting", "notes", "document", "discussion"],
		tags: [{ id: "tag6", name: "meetings", color: "bg-indigo-500" }],
	},
	{
		id: "5",
		name: "Project_Proposal.pdf",
		type: "document",
		size: "4.2 MB",
		modified: "May 1, 2024",
		keywords: ["project", "proposal", "document", "plan"],
		tags: [
			{ id: "tag7", name: "projects", color: "bg-pink-500" },
			{ id: "tag2", name: "important", color: "bg-red-500" },
		],
	},
	{
		id: "6",
		name: "Client_Presentation.pptx",
		type: "presentation",
		size: "15.3 MB",
		modified: "April 28, 2024",
		keywords: ["presentation", "client", "slides", "proposal"],
		tags: [
			{ id: "tag8", name: "presentations", color: "bg-orange-500" },
			{ id: "tag9", name: "client", color: "bg-cyan-500" },
		],
	},
	{
		id: "7",
		name: "Team_Photos",
		type: "folder",
		size: "156 MB",
		modified: "April 25, 2024",
		keywords: ["photos", "team", "images", "pictures"],
		tags: [{ id: "tag10", name: "photos", color: "bg-emerald-500" }],
	},
	{
		id: "8",
		name: "Expense_Report_March.xlsx",
		type: "spreadsheet",
		size: "890 KB",
		modified: "April 20, 2024",
		keywords: ["expense", "report", "march", "billing", "accounting"],
		tags: [
			{ id: "tag3", name: "billing", color: "bg-blue-500" },
			{ id: "tag11", name: "expenses", color: "bg-amber-500" },
		],
	},
];

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
	const [query, setQuery] = useState("");
	const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
	const [selectedFile, setSelectedFile] = useState<string | null>(null);
	const [extractedKeywords, setExtractedKeywords] = useState<string[]>([]);
	const [hasSearched, setHasSearched] = useState(false);

	const handleSearch = (searchQuery?: string) => {
		const queryToSearch = searchQuery || query;
		if (!queryToSearch.trim()) {
			setSearchResults([]);
			setExtractedKeywords([]);
			setHasSearched(false);
			return;
		}

		// Simple keyword extraction
		const keywords = queryToSearch
			.toLowerCase()
			.split(/\s+/)
			.filter(word => word.length > 2);
		setExtractedKeywords(keywords);

		// Filter files based on keywords
		const results = DEMO_FILES.filter(file => {
			const searchText =
				`${file.name} ${file.keywords.join(" ")} ${file.tags.map(t => t.name).join(" ")}`.toLowerCase();
			return keywords.some(keyword => searchText.includes(keyword.toLowerCase()));
		});

		setSearchResults(results);
		setHasSearched(true);
	};

	const handleKeyPress = (e: KeyboardEvent) => {
		if (e.key === "Enter") {
			handleSearch();
		}
	};

	const handleSuggestionClick = (suggestionQuery: string) => {
		setQuery(suggestionQuery);
		handleSearch(suggestionQuery);
	};

	const toggleFileSelection = (fileId: string) => {
		setSelectedFile(prev => (prev === fileId ? null : fileId));
	};

	const addTagToSelected = (tagName: string) => {
		if (!selectedFile) return;

		const newTag = {
			id: `tag_${Date.now()}`,
			name: tagName,
			color: "bg-blue-500",
		};

		setSearchResults(prev =>
			prev.map(file => (file.id === selectedFile ? { ...file, tags: [...file.tags, newTag] } : file))
		);

		setSelectedFile(null); // Clear selection after tagging
	};

	const getFileIcon = (type: string) => {
		switch (type) {
			case "folder":
				return <Folder className="h-4 w-4 text-blue-500" />;
			case "spreadsheet":
				return <FileText className="h-4 w-4 text-green-500" />;
			case "presentation":
				return <FileText className="h-4 w-4 text-orange-500" />;
			default:
				return <FileText className="h-4 w-4 text-gray-500" />;
		}
	};

	// Reset when dialog closes
	const handleOpenChange = (newOpen: boolean) => {
		if (!newOpen) {
			setQuery("");
			setSearchResults([]);
			setSelectedFile(null);
			setExtractedKeywords([]);
			setHasSearched(false);
		}
		onOpenChange(newOpen);
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="flex h-[90vh] max-h-[90vh] flex-col p-0 sm:max-w-[850px] lg:max-w-4xl">
				<DialogHeader className="border-b p-6">
					<div className="flex items-center justify-between">
						<div>
							<DialogTitle className="flex items-center gap-2">
								<Search className="h-5 w-5 text-blue-500" />
								Advanced Search
							</DialogTitle>
							<DialogDescription className="mt-1">
								Search through your files and organize them with tags
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
								placeholder="Search for files, documents, folders..."
								value={query}
								onChange={e => setQuery(e.target.value)}
								onKeyDown={handleKeyPress}
								className="pl-10"
								autoFocus
							/>
						</div>
						<Button onClick={() => handleSearch()} disabled={!query.trim()}>
							<Search className="mr-2 h-4 w-4" />
							Search
						</Button>
					</div>

					{/* Quick Search Examples */}
					<div className="flex flex-wrap gap-2">
						<Button variant="outline" size="sm" onClick={() => handleSuggestionClick("spreadsheet billing")}>
							<FileText className="mr-1 h-3 w-3" />
							Billing spreadsheets
						</Button>
						<Button variant="outline" size="sm" onClick={() => handleSuggestionClick("financial report")}>
							<FileText className="mr-1 h-3 w-3" />
							Financial reports
						</Button>
						<Button variant="outline" size="sm" onClick={() => handleSuggestionClick("presentation client")}>
							<FileText className="mr-1 h-3 w-3" />
							Client presentations
						</Button>
						{selectedFile && (
							<Button variant="outline" size="sm" className="border-blue-500 text-blue-600">
								<Tag className="mr-1 h-3 w-3" />
								Tag Selected
							</Button>
						)}
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
					{searchResults.length > 0 ? (
						<div className="flex h-full flex-col">
							<div className="flex flex-shrink-0 items-center justify-between border-b py-3">
								<h3 className="text-lg font-semibold">
									Found {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}
								</h3>
								{selectedFile && (
									<div className="flex items-center gap-2">
										<span className="text-muted-foreground text-sm">1 selected</span>
										<Button size="sm" onClick={() => addTagToSelected("important")}>
											<Tag className="mr-1 h-3 w-3" />
											Add Tag
										</Button>
									</div>
								)}
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
														{getFileIcon(file.type)}
														<div className="min-w-0 flex-1">
															<h4 className="truncate font-medium">{file.name}</h4>
															<div className="text-muted-foreground flex items-center gap-2 text-sm">
																<span>{file.modified}</span>
																<span>•</span>
																<span>{file.size}</span>
																<span>•</span>
																<span className="capitalize">{file.type}</span>
															</div>
														</div>
													</div>
													<div className="ml-4 flex flex-wrap gap-1">
														{file.tags.map(tag => (
															<Badge
																key={tag.id}
																variant="secondary"
																className={`text-xs ${tag.color} text-white hover:border-neutral-400 hover:bg-neutral-100 hover:text-black dark:hover:border-neutral-600 dark:hover:bg-neutral-900 dark:hover:text-neutral-200`}
															>
																{tag.name}
															</Badge>
														))}
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

				{/* Quick Actions */}
				{searchResults.length > 0 && (
					<div className="flex-shrink-0 border-t p-6">
						<div className="mb-2 flex items-center gap-2">
							<Tag className="text-primary h-4 w-4" />
							<span className="text-sm font-medium">Quick actions:</span>
						</div>
						<div className="flex flex-wrap gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => addTagToSelected("important")}
								disabled={!selectedFile}
							>
								Tag as Important
							</Button>
							<Button variant="outline" size="sm" onClick={() => addTagToSelected("work")} disabled={!selectedFile}>
								Tag as Work
							</Button>
							<Button variant="outline" size="sm" onClick={() => addTagToSelected("archive")} disabled={!selectedFile}>
								Tag as Archive
							</Button>
						</div>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}

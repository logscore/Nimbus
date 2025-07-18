import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

export interface HeaderSearchProps {
	placeholder?: string;
	className?: string;
	onSearch?: (query: string) => void;
	onFocus?: () => void;
}

export function HeaderSearch({ placeholder = "Search...", className = "", onSearch, onFocus }: HeaderSearchProps) {
	const [query, setQuery] = useState("");

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && onSearch) {
			onSearch(query);
		}
	};

	return (
		<div className={cn("relative flex max-w-xl flex-1 items-center", className)}>
			<div className="pointer-events-none absolute left-2.5">
				<Search className="text-muted-foreground h-4 w-4" />
			</div>
			<Input
				type="search"
				placeholder={placeholder}
				className="bg-muted/50 w-full pl-8"
				value={query}
				onChange={e => setQuery(e.target.value)}
				onKeyDown={handleKeyDown}
				onFocus={onFocus}
			/>
		</div>
	);
}

function cn(...classes: (string | undefined)[]) {
	return classes.filter(Boolean).join(" ");
}

import { SourceSelector } from "../../header/components/source-selector";
import { HeaderActions } from "../../header/components/header-actions";
import { HeaderSearch } from "../../header/components/header-search";
import { SearchDialog } from "@/components/search/search-dialog";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useState } from "react";

export function Header() {
	const [isSearchOpen, setIsSearchOpen] = useState(false);

	return (
		<header className="bg-background border-b">
			<div className="flex h-16 items-center justify-between gap-4 px-4">
				<SidebarTrigger className="size-9 cursor-pointer" />
				<SourceSelector />

				<div className="flex max-w-xl flex-1 items-center">
					<HeaderSearch
						placeholder="Search smarter with AI"
						onFocus={() => setIsSearchOpen(true)}
						onSearch={query => console.log("Search:", query)}
					/>
				</div>

				<HeaderActions />
			</div>

			<SearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
		</header>
	);
}

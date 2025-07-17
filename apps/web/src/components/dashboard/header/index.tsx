import { UploadButton } from "@/components/upload-button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { FileBreadcrumb } from "./file-path";

export function Header() {
	return (
		<header className="bg-background">
			<div className="flex items-center justify-center gap-2.5 self-stretch py-1 pr-2 pl-6">
				<SidebarTrigger className="block size-9 cursor-pointer md:hidden" />
				{/* Bread Crumb */}
				<FileBreadcrumb />
				{/* Filter Button */}

				{/* Share button */}

				{/* Upload files button */}
				<UploadButton />
			</div>
		</header>
	);
}

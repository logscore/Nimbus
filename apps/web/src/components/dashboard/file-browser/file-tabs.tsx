import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter, useSearchParams } from "next/navigation";

export function FileTabs({ type }: { type: string | null }) {
	const router = useRouter();
	const searchParams = useSearchParams();

	const handleTabChange = (value: string) => {
		const params = new URLSearchParams(searchParams);
		if (value === "all") {
			params.delete("type");
		} else {
			params.set("type", value);
		}
		router.push(`?${params.toString()}`);
	};

	return (
		<Tabs value={type ?? "all"} onValueChange={handleTabChange} className="w-[400px]">
			<TabsList className="bg-muted/50 grid w-full grid-cols-4 rounded-lg p-1">
				<TabsTrigger
					value="all"
					className="data-[state=active]:bg-background data-[state=active]:text-foreground text-sm transition-all data-[state=active]:shadow-sm"
				>
					All
				</TabsTrigger>
				<TabsTrigger
					value="folder"
					className="data-[state=active]:bg-background data-[state=active]:text-foreground text-sm transition-all data-[state=active]:shadow-sm"
				>
					Folders
				</TabsTrigger>
				<TabsTrigger
					value="document"
					className="data-[state=active]:bg-background data-[state=active]:text-foreground text-sm transition-all data-[state=active]:shadow-sm"
				>
					Documents
				</TabsTrigger>
				<TabsTrigger
					value="media"
					className="data-[state=active]:bg-background data-[state=active]:text-foreground text-sm transition-all data-[state=active]:shadow-sm"
				>
					Media
				</TabsTrigger>
			</TabsList>
		</Tabs>
	);
}

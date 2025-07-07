import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function FileTabs({ type }: { type: string | null }) {
	return (
		<Tabs value={type ?? "all"} className="w-[400px]">
			<TabsList>
				<TabsTrigger asChild value="all">
					<p>All</p>
				</TabsTrigger>
				<TabsTrigger asChild value="folder">
					<p>Folders</p>
				</TabsTrigger>
				<TabsTrigger asChild value="document">
					<p>Documents</p>
				</TabsTrigger>
				<TabsTrigger asChild value="media">
					<p>Media</p>
				</TabsTrigger>
			</TabsList>
		</Tabs>
	);
}

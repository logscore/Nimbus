import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

export function FilePreview() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const id = searchParams.get("id");

	const handleClose = () => {
		const params = new URLSearchParams(searchParams.toString());
		params.delete("id");
		router.replace(`?${params.toString()}`);
	};
	return (
		<Sheet open={!!id} onOpenChange={open => !open && handleClose()}>
			<SheetContent>
				<div className="p-4">
					<p>File preview is being revamped. Please check back later.</p>
				</div>
			</SheetContent>
		</Sheet>
	);
}

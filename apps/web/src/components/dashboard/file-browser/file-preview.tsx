import { useNavigate, useSearch } from "@tanstack/react-router";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export function FilePreview() {
	const navigate = useNavigate({ from: "/dashboard/$providerSlug/$accountId" });
	const searchParams = useSearch({ from: "/_protected/dashboard/$providerSlug/$accountId" });

	const handleClose = () => {
		const { id, ...restSearchParams } = searchParams;
		navigate({
			search: restSearchParams,
			replace: true,
		});
	};

	return (
		<Sheet open={!!searchParams.id} onOpenChange={open => !open && handleClose()}>
			<SheetContent>
				<div className="p-4">
					<p>File preview is being revamped. Please check back later.</p>
				</div>
			</SheetContent>
		</Sheet>
	);
}

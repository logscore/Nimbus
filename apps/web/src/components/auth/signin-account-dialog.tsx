import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AuthProviderButtons } from "@/components/auth/shared/auth-provider-buttons";
import { CheckCircle2, Sparkles, Zap } from "lucide-react";
import { authClient } from "@nimbus/auth/auth-client";
import { useLocation } from "@tanstack/react-router";
import { useIsMounted } from "@/hooks/useIsMounted";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import PlusGrid from "../cool/plus-box";
import { toast } from "sonner";

type ViewMode = "select" | "s3-form";

type SigninAccountDialogProps = {
	open: boolean;
	onOpenChange?: (open: boolean) => void;
};

async function upgradePlan() {
	const response = await authClient.checkout({
		slug: "pro",
	});
	if (response.error) {
		toast.error(response.error.message);
	}
}

export function SigninAccountDialog({ open, onOpenChange }: SigninAccountDialogProps) {
	const isMounted = useIsMounted();

	// Build callback URL safely after mount
	const pathname = useLocation({
		select: location => location.pathname,
	});

	const [callbackURL, setCallbackURL] = useState<string>("");
	const [viewMode, setViewMode] = useState<ViewMode>("select");

	const { data: subscriptions } = useQuery({
		queryKey: ["subscriptions"],
		queryFn: async () => {
			const response = await authClient.customer.subscriptions.list({
				query: {
					page: 1,
					limit: 10,
					active: true,
				},
			});
			return response.data;
		},
	});

	useEffect(() => {
		if (isMounted) {
			const url = `${window.location.origin}${pathname}`;
			setCallbackURL(url);
		}
	}, [isMounted, pathname]);

	// Reset the internal view when dialog closes
	useEffect(() => {
		if (!open) {
			setViewMode("select");
		}
	}, [open]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent showBackButton={viewMode === "s3-form"} onBack={() => setViewMode("select")}>
				{subscriptions && subscriptions.result.items.length > 0 ? (
					<>
						<DialogHeader>
							<DialogTitle>Sign in with an account</DialogTitle>
							<DialogDescription>Connect a storage provider to access your data</DialogDescription>
						</DialogHeader>
						<div className="flex flex-col gap-4 py-4">
							<AuthProviderButtons action="signin" callbackURL={callbackURL} />
						</div>
					</>
				) : (
					<>
						<DialogHeader className="space-y-2 text-center">
							<DialogTitle className="text-2xl font-bold tracking-tight">
								Go{" "}
								<span className="from-primary to-primary/60 animate-gradient bg-gradient-to-r bg-clip-text text-transparent">
									Pro
								</span>
								<Zap className="mb-1 ml-2 inline-block h-6 w-6 text-yellow-400" />
							</DialogTitle>
							<DialogDescription className="text-base">Be the most productive you</DialogDescription>
						</DialogHeader>

						<div className="relative flex flex-col items-center justify-center overflow-hidden py-6">
							{/* Subtle animated background shimmer */}
							<div className="from-muted/40 to-background absolute inset-0 animate-pulse rounded-lg bg-gradient-to-br via-transparent opacity-60 blur-2xl" />

							{/* Image placeholder */}
							<div className="relative flex aspect-[15/5] w-full items-center justify-center overflow-hidden rounded-lg border backdrop-blur-sm">
								<PlusGrid />
							</div>
						</div>

						<div className="space-y-3">
							<div className="flex items-center gap-3">
								<CheckCircle2 className="h-5 w-5 text-green-400" />
								<span className="text-sm font-medium">1 TB of our secure file storage</span>
							</div>
							<div className="flex items-center gap-3">
								<CheckCircle2 className="h-5 w-5 text-green-400" />
								<span className="text-sm font-medium">Connect as many storage providers as you want</span>
							</div>
							<div className="flex items-center gap-3">
								<CheckCircle2 className="h-5 w-5 text-green-400" />
								<span className="text-sm font-medium">AI-powered search. Never lose a file again.</span>
							</div>
						</div>

						<div className="mt-6 flex flex-col gap-4">
							<Button
								size="lg"
								className="group relative w-full overflow-hidden transition-transform hover:scale-99 active:scale-97"
								onClick={upgradePlan}
							>
								<Sparkles className="h-4 w-4" />

								<span className="relative z-10">Upgrade to Pro</span>
								{/* Soft hover highlight effect */}
								<div className="from-primary/30 to-primary/10 absolute inset-0 bg-gradient-to-r opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
							</Button>
						</div>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}

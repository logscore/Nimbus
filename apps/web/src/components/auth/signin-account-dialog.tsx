import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AuthProviderButtons } from "@/components/auth/shared/auth-provider-buttons";
import { useLocation } from "@tanstack/react-router";
import { useIsMounted } from "@/hooks/useIsMounted";
import { useEffect, useState } from "react";

type SigninAccountDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

type ViewMode = "select" | "s3-form";

export function SigninAccountDialog({ open, onOpenChange }: SigninAccountDialogProps) {
	const isMounted = useIsMounted();
	const pathname = useLocation({
		select: location => location.pathname,
	});
	const [callbackURL, setCallbackURL] = useState<string>("");
	const [viewMode, setViewMode] = useState<ViewMode>("select");

	useEffect(() => {
		if (isMounted) {
			const callbackURL = `${window.location.origin}${pathname}`;
			setCallbackURL(callbackURL);
		}
	}, [isMounted, pathname]);

	// Reset view mode when dialog closes
	useEffect(() => {
		if (!open) {
			setViewMode("select");
		}
	}, [open]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className="sm:max-w-[500px]"
				showBackButton={viewMode === "s3-form"}
				onBack={() => setViewMode("select")}
			>
				{viewMode === "select" && (
					<DialogHeader>
						<DialogTitle>Sign in with an account</DialogTitle>
						<DialogDescription>Connect a social account to sign in with it later.</DialogDescription>
					</DialogHeader>
				)}
				<div className="flex flex-col gap-4 py-4">
					<AuthProviderButtons action="signin" callbackURL={callbackURL} />
				</div>
			</DialogContent>
		</Dialog>
	);
}

"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AuthProviderButtons } from "@/components/auth/shared/auth-provider-buttons";
import { S3AccountForm } from "@/components/settings/s3-account-form";
import { useIsMounted } from "@/hooks/useIsMounted";
import type { DriveProvider } from "@nimbus/shared";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type SigninAccountDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

type ViewMode = "select" | "s3-form";

export function SigninAccountDialog({ open, onOpenChange }: SigninAccountDialogProps) {
	const isMounted = useIsMounted();
	const pathname = usePathname();
	const [callbackURL, setCallbackURL] = useState<string>("");
	const [viewMode, setViewMode] = useState<ViewMode>("select");
	const [isLoading] = useState<Record<DriveProvider, boolean>>({
		google: false,
		microsoft: false,
		s3: false,
		box: false,
	});

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

	const handleS3Success = () => {
		onOpenChange(false);
	};

	const handleS3Cancel = () => {
		setViewMode("select");
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className="sm:max-w-[500px]"
				showBackButton={viewMode === "s3-form"}
				onBack={() => setViewMode("select")}
			>
				{viewMode === "s3-form" && (
					<DialogHeader className="py-2 text-center">
						<DialogTitle>Add S3 Account</DialogTitle>
						<DialogDescription>Enter your S3 credentials to connect your bucket.</DialogDescription>
					</DialogHeader>
				)}
				{viewMode === "select" && (
					<DialogHeader>
						<DialogTitle>Sign in with an account</DialogTitle>
						<DialogDescription>Connect a social account to sign in with it later.</DialogDescription>
					</DialogHeader>
				)}

				{viewMode === "select" ? (
					<div className="flex flex-col gap-4 py-4">
						<AuthProviderButtons
							action="signin"
							isLoading={isLoading}
							showS3Button={true}
							callbackURL={callbackURL}
							onAuthSuccess={() => onOpenChange(false)}
							onS3Click={() => setViewMode("s3-form")}
						/>
					</div>
				) : (
					<div className="py-4">
						<S3AccountForm onSuccess={handleS3Success} onCancel={handleS3Cancel} />
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}

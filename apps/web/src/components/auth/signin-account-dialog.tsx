"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AuthProviderButtons } from "@/components/auth/shared/auth-provider-buttons";
import { UpgradeDialog } from "@/components/subscription/upgrade-dialog";
import { S3AccountForm } from "@/components/settings/s3-account-form";
import { useSubscription } from "@/hooks/useSubscription";
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
	const {
		subscription,
		connectionCount,
		maxConnections,
		canAddConnection,
		refetch: refetchSubscription,
	} = useSubscription();
	const [callbackURL, setCallbackURL] = useState<string>("");
	const [viewMode, setViewMode] = useState<ViewMode>("select");
	const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
	const [isLoading] = useState<Record<DriveProvider, boolean>>({
		google: false,
		microsoft: false,
		s3: false,
		box: false,
		dropbox: false,
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
		refetchSubscription();
		onOpenChange(false);
	};

	const handleS3Cancel = () => {
		setViewMode("select");
	};

	const handleProviderClick = (provider: DriveProvider) => {
		// Check subscription limits before allowing connection
		if (!canAddConnection) {
			onOpenChange(false);
			setShowUpgradeDialog(true);
			return false;
		}
		return true;
	};

	const handleAuthSuccess = () => {
		refetchSubscription();
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className="sm:max-w-[500px]"
				showBackButton={viewMode === "s3-form"}
				onBack={() => setViewMode("select")}
			>
				{/*
				{viewMode === "s3-form" && (
					<DialogHeader className="py-2 text-center">
						<DialogTitle>Add S3 Account</DialogTitle>
						<DialogDescription>Enter your S3 credentials to connect your bucket.</DialogDescription>
					</DialogHeader>
				)}
				*/}
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
							onAuthSuccess={handleAuthSuccess}
							onS3Click={() => {
								if (handleProviderClick("s3")) {
									setViewMode("s3-form");
								}
							}}
							onProviderClick={handleProviderClick}
						/>
					</div>
				) : (
					<div className="py-4">
						<S3AccountForm onSuccess={handleS3Success} onCancel={handleS3Cancel} />
					</div>
				)}
			</DialogContent>

			{subscription && (
				<UpgradeDialog
					open={showUpgradeDialog}
					onOpenChange={setShowUpgradeDialog}
					currentPlan={subscription.plan}
					currentConnectionCount={connectionCount}
					maxConnections={maxConnections}
				/>
			)}
		</Dialog>
	);
}

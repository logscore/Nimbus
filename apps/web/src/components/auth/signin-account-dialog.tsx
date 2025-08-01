"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SocialAuthButton } from "@/components/auth/shared/social-auth-button";
import { S3AccountForm } from "@/components/settings/s3-account-form";
import { useGoogleAuth, useMicrosoftAuth } from "@/hooks/useAuth";
import { useIsMounted } from "@/hooks/useIsMounted";
import type { DriveProvider } from "@nimbus/shared";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { Cloud, Loader2 } from "lucide-react";
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
	const [isLoading, setIsLoading] = useState<Record<DriveProvider, boolean>>({
		google: false,
		microsoft: false,
		s3: false,
	});
	const { signInWithGoogleProvider } = useGoogleAuth();
	const { signInWithMicrosoftProvider } = useMicrosoftAuth();

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

	const handleSocialAuth = async (provider: DriveProvider) => {
		try {
			setIsLoading(prev => ({ ...prev, [provider]: true }));

			if (provider === "google") {
				await signInWithGoogleProvider({ callbackURL });
			} else if (provider === "microsoft") {
				await signInWithMicrosoftProvider({ callbackURL });
			}

			onOpenChange(false);
		} catch (error) {
			console.error(`Error signing in with ${provider}:`, error);
		} finally {
			setIsLoading(prev => ({ ...prev, [provider]: false }));
		}
	};

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
						<SocialAuthButton
							provider="google"
							action="signin"
							onClick={() => handleSocialAuth("google")}
							disabled={isLoading.google}
						>
							{isLoading.google && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						</SocialAuthButton>

						<SocialAuthButton
							provider="microsoft"
							action="signin"
							onClick={() => handleSocialAuth("microsoft")}
							disabled={isLoading.microsoft}
						>
							{isLoading.microsoft && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						</SocialAuthButton>

						<Button
							variant="outline"
							onClick={() => setViewMode("s3-form")}
							disabled={isLoading.s3}
							className="flex items-center gap-2"
						>
							<Cloud className="h-4 w-4" />
							Amazon S3 / S3-Compatible
						</Button>
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

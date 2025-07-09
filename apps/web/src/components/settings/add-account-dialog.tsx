"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SocialAuthButton } from "@/components/auth/shared/social-auth-button";
import { useGoogleAuth, useMicrosoftAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { useState } from "react";

type AddAccountDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onAccountAdded: () => void;
};

export function AddAccountDialog({ open, onOpenChange, onAccountAdded }: AddAccountDialogProps) {
	const [isLoading, setIsLoading] = useState<Record<string, boolean>>({
		google: false,
		microsoft: false,
	});

	const { signInWithGoogleProvider } = useGoogleAuth();
	const { signInWithMicrosoftProvider } = useMicrosoftAuth();

	const handleSocialAuth = async (provider: "google" | "microsoft") => {
		try {
			setIsLoading(prev => ({ ...prev, [provider]: true }));

			if (provider === "google") {
				await signInWithGoogleProvider();
			} else if (provider === "microsoft") {
				await signInWithMicrosoftProvider();
			}

			onAccountAdded();
			onOpenChange(false);
		} catch (error) {
			console.error(`Error signing in with ${provider}:`, error);
		} finally {
			setIsLoading(prev => ({ ...prev, [provider]: false }));
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Add an account</DialogTitle>
					<DialogDescription>Connect a social account to sign in with it later.</DialogDescription>
				</DialogHeader>

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
				</div>
			</DialogContent>
		</Dialog>
	);
}

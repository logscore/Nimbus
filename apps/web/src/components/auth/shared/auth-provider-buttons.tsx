"use client";

import { useBoxAuth, useGoogleAuth, useMicrosoftAuth } from "@/hooks/useAuth";
import { SocialAuthButton } from "./social-auth-button";
import { Button } from "@/components/ui/button";
import { Cloud, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type AuthProvider = "google" | "microsoft" | "box" | "s3";

type AuthProviderButtonsProps = {
	onProviderClick?: (provider: AuthProvider) => Promise<void> | void;
	isLoading?: boolean | Record<AuthProvider, boolean>;
	action: "signin" | "signup";
	showS3Button?: boolean;
	callbackURL?: string;
	onAuthSuccess?: () => void;
	onS3Click?: () => void;
};

export function AuthProviderButtons({
	onProviderClick,
	isLoading: externalIsLoading,
	action,
	showS3Button = false,
	callbackURL,
	onAuthSuccess,
	onS3Click,
}: AuthProviderButtonsProps) {
	// Use external loading state or manage internal loading state
	const [internalIsLoading, setInternalIsLoading] = useState<Record<AuthProvider, boolean>>({
		google: false,
		microsoft: false,
		box: false,
		s3: false,
	});

	const isLoading = externalIsLoading || internalIsLoading;

	const getIsLoading = (provider: AuthProvider) => {
		return typeof isLoading === "boolean" ? isLoading : isLoading[provider];
	};

	const { signInWithGoogleProvider } = useGoogleAuth();
	const { signInWithMicrosoftProvider } = useMicrosoftAuth();
	const { signInWithBoxProvider } = useBoxAuth();

	const handleSocialAuth = async (provider: Exclude<AuthProvider, "s3">) => {
		try {
			// If external handler is provided, use it
			if (onProviderClick) {
				return await onProviderClick(provider);
			}

			// Otherwise, handle internally
			setInternalIsLoading(prev => ({ ...prev, [provider]: true }));

			if (provider === "google") {
				await signInWithGoogleProvider({ callbackURL });
			} else if (provider === "microsoft") {
				await signInWithMicrosoftProvider({ callbackURL });
			} else if (provider === "box") {
				await signInWithBoxProvider({ callbackURL });
			}

			onAuthSuccess?.();
		} catch (error) {
			console.error(`Error signing in with ${provider}:`, error);
			toast.error(`${provider.charAt(0).toUpperCase() + provider.slice(1)} authentication failed`);
		} finally {
			setInternalIsLoading(prev => ({ ...prev, [provider]: false }));
		}
	};

	const handleProviderClick = async (provider: AuthProvider) => {
		if (provider === "s3") {
			if (onProviderClick) {
				await onProviderClick("s3");
			} else if (onS3Click) {
				onS3Click();
			}
		} else {
			await handleSocialAuth(provider);
		}
	};

	return (
		<>
			<SocialAuthButton
				provider="google"
				action={action}
				onClick={() => handleProviderClick("google")}
				disabled={getIsLoading("google")}
			>
				{getIsLoading("google") && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
			</SocialAuthButton>

			<SocialAuthButton
				provider="microsoft"
				action={action}
				onClick={() => handleProviderClick("microsoft")}
				disabled={getIsLoading("microsoft")}
			>
				{getIsLoading("microsoft") && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
			</SocialAuthButton>

			<SocialAuthButton
				provider="box"
				action={action}
				onClick={() => handleProviderClick("box")}
				disabled={getIsLoading("box")}
			>
				{getIsLoading("box") && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
			</SocialAuthButton>

			{showS3Button && (
				<Button
					variant="outline"
					onClick={() => handleProviderClick("s3")}
					disabled={getIsLoading("s3")}
					className="flex items-center gap-2"
				>
					<Cloud className="h-4 w-4" />
					Amazon S3 / S3-Compatible
				</Button>
			)}
		</>
	);
}

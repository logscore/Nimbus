import { SocialAuthButton } from "./social-auth-button";
import type { DriveProvider } from "@nimbus/shared";
import { useSocialAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

type AuthProviderButtonsProps = {
	action: "signin" | "signup";
	callbackURL?: string;
};

export function AuthProviderButtons({ action, callbackURL }: AuthProviderButtonsProps) {
	const socialAuthMutation = useSocialAuth();
	const isLoading = socialAuthMutation.isPending;

	return (
		<>
			<SocialAuthButton
				provider="google"
				action={action}
				onClick={() => socialAuthMutation.mutate({ provider: "google", callbackURL })}
				disabled={isLoading}
				className={`{isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
			></SocialAuthButton>

			<SocialAuthButton
				provider="microsoft"
				action={action}
				onClick={() => socialAuthMutation.mutate({ provider: "microsoft", callbackURL })}
				disabled={isLoading}
				className={`{isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
			></SocialAuthButton>
		</>
	);
}

import {
	emailObjectSchema,
	type CheckEmailExists,
	type DriveProvider,
	type ForgotPasswordFormData,
	type ResetPasswordFormData,
	type SignInFormData,
	type SignUpFormData,
} from "@nimbus/shared";
import { authClient } from "@nimbus/auth/auth-client";
import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { publicClient } from "@/utils/client";
import env from "@nimbus/env/client";
import { toast } from "sonner";

// Simple error handler
const handleAuthError = (error: unknown, defaultMessage: string): string => {
	if (error instanceof Error) {
		return error.message || defaultMessage;
	}
	return defaultMessage;
};

// Social auth hook
export const useSocialAuth = () => {
	const navigate = useNavigate();

	return useMutation({
		mutationFn: async (options: { provider: DriveProvider; callbackURL?: string }) => {
			const isLoggedIn = await authClient.getSession();
			const action = isLoggedIn.data?.session ? "link" : "signin";
			const providerName = options.provider.charAt(0).toUpperCase() + options.provider.slice(1);

			const authPromise =
				action === "link"
					? authClient.linkSocial({
							provider: options.provider,
							callbackURL: options.callbackURL || `${env.VITE_FRONTEND_URL}/dashboard`,
						})
					: authClient.signIn.social({
							provider: options.provider,
							callbackURL: `${env.VITE_FRONTEND_URL}/dashboard`,
						});

			return toast.promise(authPromise, {
				loading: action === "link" ? `Linking ${providerName} account...` : `Signing in with ${providerName}...`,
				success: action === "link" ? `Successfully linked ${providerName} account` : `Signed in with ${providerName}`,
				error: error => handleAuthError(error, `${options.provider} authentication failed`),
			});
		},
		onSuccess: () => {
			navigate({ to: "/dashboard" });
		},
	});
};

// Sign in hook
export const useSignIn = () => {
	const navigate = useNavigate();

	return useMutation({
		mutationFn: async (data: SignInFormData) => {
			await authClient.signIn.email(
				{
					email: data.email,
					password: data.password,
					rememberMe: data.remember,
				},
				{
					onSuccess: () => {
						const redirectUrl = new URLSearchParams(window.location.search).get("redirect") || "/dashboard";
						navigate({ to: redirectUrl });
					},
					onError: ctx => {
						throw ctx.error;
					},
				}
			);
			return data.email;
		},
		onSuccess: email => {
			toast.success(`Welcome back, ${email}!`);
		},
		onError: error => {
			toast.error(handleAuthError(error, "Unable to sign in. Please try again."));
		},
	});
};

// Sign up hook
export const useSignUp = () => {
	const navigate = useNavigate();

	return useMutation({
		mutationFn: async (data: SignUpFormData) => {
			const fullName = `${data.firstName} ${data.lastName}`;
			await authClient.signUp.email({
				name: fullName,
				email: data.email,
				password: data.password,
				callbackURL: `${env.VITE_FRONTEND_URL}/dashboard`,
			});
			return fullName;
		},
		onSuccess: fullName => {
			navigate({ to: "/dashboard" });
		},
		onError: error => {
			let errorMessage = "Unable to create your account. Please try again.";
			if (error instanceof Error) {
				if (error.message.toLowerCase().includes("exists")) {
					errorMessage = "An account with this email already exists. Please sign in instead.";
				} else if (error.message.toLowerCase().includes("password")) {
					errorMessage = "Password doesn't meet requirements. Please check and try again.";
				} else {
					errorMessage = error.message;
				}
			}
			toast.error(errorMessage);
		},
	});
};

// Sign out hook
export const useSignOut = () => {
	const navigate = useNavigate();

	return useMutation({
		mutationFn: async (options?: { redirectTo?: string }) => {
			const response = await authClient.signOut();
			const data = response.data;
			const success = data?.success ?? false;

			if (!success) {
				throw new Error("Sign out failed");
			}

			return { success: true, redirectPath: options?.redirectTo || "/signin" };
		},
		onSuccess: ({ redirectPath }) => {
			toast.success("Signed out successfully");
			navigate({ to: redirectPath });
		},
		onError: error => {
			toast.error(handleAuthError(error, "Sign out failed"));
		},
	});
};

// Check email exists hook
export const useCheckEmailExists = () => {
	return useMutation<CheckEmailExists, Error, string>({
		mutationFn: async (email: string) => {
			const body = { email };
			const result = emailObjectSchema.safeParse(body);
			if (!result.success) {
				throw new Error(result.error.message);
			}
			const response = await publicClient.api.auth["check-email"].$post({ json: body });
			return (await response.json()) as CheckEmailExists;
		},
	});
};

// Forgot password hook
export const useForgotPassword = () => {
	return useMutation({
		mutationFn: async (data: ForgotPasswordFormData) => {
			await authClient.forgetPassword({
				email: data.email,
				redirectTo: `${window.location.origin}/reset-password`,
			});
		},
		onSuccess: () => {
			toast.success("If an account exists with this email, you will receive a password reset link.");
		},
		onError: error => {
			toast.error(handleAuthError(error, "Failed to send password reset email. Please try again."));
		},
	});
};

// Reset password hook
export const useResetPassword = () => {
	const navigate = useNavigate();

	return useMutation({
		mutationFn: async ({ data, token }: { data: ResetPasswordFormData; token: string }) => {
			if (!token) {
				throw new Error("Reset token is missing");
			}

			await authClient.resetPassword({
				token,
				newPassword: data.password,
			});
		},
		onSuccess: () => {
			navigate({ to: "/signin" });
			toast.success("Your password has been reset successfully. You can now sign in with your new password.");
		},
		onError: error => {
			toast.error(handleAuthError(error, "Failed to reset password. The link may have expired or is invalid."));
		},
	});
};

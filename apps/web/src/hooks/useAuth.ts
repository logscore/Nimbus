import {
	emailObjectSchema,
	type AuthState,
	type DriveProvider,
	type ForgotPasswordFormData,
	type ResetPasswordFormData,
	type SignInFormData,
	type SignUpFormData,
} from "@nimbus/shared";
import { authClient, BASE_CALLBACK_URL } from "@nimbus/auth/auth-client";
import { useSearchParamsSafely } from "@/hooks/useSearchParamsSafely";
import { useMutation } from "@tanstack/react-query";
import { publicClient } from "@/utils/client";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const signInWithProvider = async (provider: DriveProvider) => {
	return authClient.signIn.social({
		provider,
		callbackURL: BASE_CALLBACK_URL,
	});
};

const linkSessionWithProvider = async (provider: DriveProvider) => {
	return authClient.linkSocial({
		provider,
		callbackURL: BASE_CALLBACK_URL,
	});
};

const handleAuthError = (error: unknown, defaultMessage: string): string => {
	if (error instanceof Error) {
		return error.message || defaultMessage;
	}
	return defaultMessage;
};

const getProviderDisplayName = (provider: DriveProvider): string => {
	return provider.charAt(0).toUpperCase() + provider.slice(1);
};

export const useSocialAuth = (provider: DriveProvider) => {
	const [isLoading, setIsLoading] = useState(false);
	const providerName = getProviderDisplayName(provider);

	const handleAuth = useCallback(async () => {
		setIsLoading(true);

		try {
			const isLoggedIn = await authClient.getSession();
			const action = isLoggedIn.data?.session ? "link" : "signin";

			const authPromise = action === "link" ? linkSessionWithProvider(provider) : signInWithProvider(provider);

			toast.promise(authPromise, {
				loading: action === "link" ? `Linking ${providerName} account...` : `Signing in with ${providerName}...`,
				success: action === "link" ? `Successfully linked ${providerName} account` : `Signed in with ${providerName}`,
				error: (error: unknown) => handleAuthError(error, `${providerName} authentication failed`),
			});

			return true;
		} catch (error) {
			const errorMessage = handleAuthError(error, `${providerName} authentication failed`);
			toast.error(errorMessage);
			return false;
		} finally {
			setIsLoading(false);
		}
	}, [provider, providerName]);

	return { handleAuth, isLoading };
};

export const useGoogleAuth = () => {
	const { handleAuth, isLoading } = useSocialAuth("google");
	return {
		signInWithGoogleProvider: handleAuth,
		isLoading,
	};
};

export const useMicrosoftAuth = () => {
	const { handleAuth, isLoading } = useSocialAuth("microsoft");
	return {
		signInWithMicrosoftProvider: handleAuth,
		isLoading,
	};
};

const useRedirect = () => {
	const router = useRouter();
	const { getParam } = useSearchParamsSafely();

	const getRedirectUrl = useCallback(() => {
		return getParam("redirect") || "/dashboard";
	}, [getParam]);

	const redirectToDashboard = useCallback(() => {
		const redirectUrl = getRedirectUrl();
		router.push(redirectUrl);
		router.refresh();
	}, [router, getRedirectUrl]);

	return { getRedirectUrl, redirectToDashboard };
};

export const useSignIn = () => {
	const [state, setState] = useState<AuthState>({ isLoading: false, error: null });
	const { signInWithGoogleProvider } = useGoogleAuth();
	const { signInWithMicrosoftProvider } = useMicrosoftAuth();

	const { redirectToDashboard } = useRedirect();

	const signInWithCredentials = useCallback(
		async (data: SignInFormData) => {
			setState({ isLoading: true, error: null });

			try {
				toast.promise(
					authClient.signIn.email(
						{
							email: data.email,
							password: data.password,
							rememberMe: data.remember,
						},
						{
							onSuccess: redirectToDashboard,
							onError: ctx => {
								throw ctx.error;
							},
						}
					),
					{
						loading: "Signing you in...",
						success: `Welcome back, ${data.email}!`,
						error: error => handleAuthError(error, "Unable to sign in. Please try again."),
					}
				);
			} catch (error) {
				const errorMessage = handleAuthError(error, "Unable to sign in. Please try again.");
				setState(prev => ({ ...prev, error: errorMessage }));
				throw error;
			} finally {
				setState(prev => ({ ...prev, isLoading: false }));
			}
		},
		[redirectToDashboard]
	);

	return {
		...state,
		signInWithCredentials,
		signInWithGoogleProvider,
		signInWithMicrosoftProvider,
	};
};

export const useSignUp = () => {
	const [state, setState] = useState<AuthState>({ isLoading: false, error: null });
	const { signInWithGoogleProvider } = useGoogleAuth();
	const { signInWithMicrosoftProvider } = useMicrosoftAuth();
	const { redirectToDashboard } = useRedirect();

	const signUpWithCredentials = useCallback(
		async (data: SignUpFormData) => {
			setState({ isLoading: true, error: null });

			try {
				const fullName = `${data.firstName} ${data.lastName}`;

				toast.promise(
					(async () => {
						try {
							await authClient.signUp.email({
								name: fullName,
								email: data.email,
								password: data.password,
								callbackURL: BASE_CALLBACK_URL,
							});
							redirectToDashboard();
						} catch (error) {
							console.error("Sign up error:", error);
							throw error;
						}
					})(),
					{
						loading: "Creating your account...",
						success: `Welcome to Nimbus, ${fullName}!`,
						error: error => {
							if (error instanceof Error) {
								if (error.message.toLowerCase().includes("exists")) {
									return "An account with this email already exists. Please sign in instead.";
								} else if (error.message.toLowerCase().includes("password")) {
									return "Password doesn't meet requirements. Please check and try again.";
								}
								return error.message;
							}
							return "Unable to create your account. Please try again.";
						},
					}
				);
			} catch (error) {
				const errorMessage = handleAuthError(error, "Unable to create your account. Please try again.");
				setState(prev => ({ ...prev, error: errorMessage }));
				throw error;
			} finally {
				setState(prev => ({ ...prev, isLoading: false }));
			}
		},
		[redirectToDashboard]
	);

	return {
		...state,
		signUpWithCredentials,
		signInWithGoogleProvider,
		signInWithMicrosoftProvider,
	};
};

export const useSignOut = () => {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	const signOut = useCallback(
		async (options?: { redirectTo?: string }) => {
			setIsLoading(true);
			try {
				const response = await authClient.signOut();
				const data = response.data;
				const success = data?.success ?? false;

				if (!success) {
					throw new Error("Sign out failed");
				}

				toast.success("Signed out successfully");

				// Redirect to the specified path or default to signin
				const redirectPath = options?.redirectTo || "/signin";
				router.push(redirectPath);
				router.refresh();

				return { success: true };
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : "Sign out failed";
				toast.error(errorMessage);
				return { success: false, error: errorMessage };
			} finally {
				setIsLoading(false);
			}
		},
		[router]
	);

	return {
		signOut,
		isLoading,
	};
};

export const checkEmailExists = async (email: string): Promise<{ exists: boolean }> => {
	try {
		const body = {
			email,
		};
		const result = emailObjectSchema.safeParse(body);
		if (!result.success) {
			throw new Error(result.error.message);
		}
		const response = await publicClient.api.auth.checkEmail.$post({ json: body });
		return response.json();
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(error.message || "Failed to check email existence");
		}
		throw error;
	}
};

export const useCheckEmailExists = () => {
	return useMutation<{ exists: boolean }, Error, string>({
		mutationFn: checkEmailExists,
	});
};

export const useForgotPassword = () => {
	const [state, setState] = useState<AuthState>({ isLoading: false, error: null });

	const forgotPassword = useCallback(async (data: ForgotPasswordFormData) => {
		setState({ isLoading: true, error: null });

		try {
			toast.promise(
				authClient.forgetPassword({
					email: data.email,
					redirectTo: `${window.location.origin}/reset-password`,
				}),
				{
					loading: "Sending password reset email...",
					success: "If an account exists with this email, you will receive a password reset link.",
					error: error => handleAuthError(error, "Failed to send password reset email. Please try again."),
				}
			);
			return true;
		} catch (error) {
			const errorMessage = handleAuthError(error, "Failed to send password reset email.");
			setState({ isLoading: false, error: errorMessage });
			throw error;
		} finally {
			setState(prev => ({ ...prev, isLoading: false }));
		}
	}, []);

	return { ...state, forgotPassword };
};

export const useResetPassword = () => {
	const router = useRouter();
	const [state, setState] = useState<AuthState>({ isLoading: false, error: null });

	const resetPassword = useCallback(
		async (data: ResetPasswordFormData, token: string) => {
			if (!token) {
				throw new Error("Reset token is missing");
			}

			setState({ isLoading: true, error: null });

			try {
				toast.promise(
					authClient.resetPassword({
						token,
						newPassword: data.password,
					}),
					{
						loading: "Resetting your password...",
						success: () => {
							router.push("/signin");
							return "Your password has been reset successfully. You can now sign in with your new password.";
						},
						error: error =>
							handleAuthError(error, "Failed to reset password. The link may have expired or is invalid."),
					}
				);
				return true;
			} catch (error) {
				const errorMessage = handleAuthError(
					error,
					"Failed to reset password. The link may have expired or is invalid."
				);
				setState(prev => ({ ...prev, error: errorMessage }));
				throw error;
			} finally {
				setState(prev => ({ ...prev, isLoading: false }));
			}
		},
		[router]
	);

	return {
		...state,
		resetPassword,
	};
};

import type { SignInFormData, SignUpFormData, ForgotPasswordFormData, ResetPasswordFormData } from "@/schemas";
import { authClient } from "@nimbus/auth/auth-client";
import { useMutation } from "@tanstack/react-query";
import { clientEnv } from "@/lib/env/client-env";
import { useState, useCallback } from "react";
import type { AuthState } from "@/lib/types";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";

export const signInWithGoogle = async () => {
	await authClient.signIn.social({
		provider: "google",
		callbackURL: clientEnv.NEXT_PUBLIC_CALLBACK_URL,
	});
};

export const useGoogleAuth = () => {
	const [isLoading, setIsLoading] = useState(false);

	const signInWithGoogleProvider = useCallback(async () => {
		setIsLoading(true);
		try {
			toast.promise(signInWithGoogle(), {
				loading: "Signing in with Google...",
				success: "Signed in with Google",
				error: error => (error instanceof Error ? error.message : "Google authentication failed"),
			});
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Google authentication failed";
			toast.error(errorMessage);
		} finally {
			setIsLoading(false);
		}
	}, []);

	return { signInWithGoogleProvider, isLoading };
};

export const useSignIn = () => {
	const router = useRouter();
	const [state, setState] = useState<AuthState>({ isLoading: false, error: null });
	const { signInWithGoogleProvider } = useGoogleAuth();

	// Get redirect URL from search params
	const getRedirectUrl = () => {
		if (typeof window !== "undefined") {
			const searchParams = new URLSearchParams(window.location.search);
			return searchParams.get("redirect") || "/app";
		}
		return "/app";
	};

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
							onSuccess: async () => {
								const redirectUrl = getRedirectUrl();
								router.push(redirectUrl);
								router.refresh();
							},
							onError: ctx => {
								throw ctx.error;
							},
						}
					),
					{
						loading: "Signing you in...",
						success: `Welcome back, ${data.email}!`,
						error: error => (error instanceof Error ? error.message : "Unable to sign in. Please try again."),
					}
				);
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : "Unable to sign in. Please try again.";
				setState({ isLoading: false, error: errorMessage });
				throw error;
			} finally {
				setState(prev => ({ ...prev, isLoading: false }));
			}
		},
		[router]
	);

	return {
		...state,
		signInWithCredentials,
		signInWithGoogleProvider,
	};
};

export const useSignUp = () => {
	const router = useRouter();
	const [state, setState] = useState<AuthState>({ isLoading: false, error: null });
	const { signInWithGoogleProvider } = useGoogleAuth();

	const signUpWithCredentials = useCallback(
		async (data: SignUpFormData) => {
			setState({ isLoading: true, error: null });

			try {
				const fullName = `${data.firstName} ${data.lastName}`;

				toast.promise(
					(async () => {
						await authClient.signUp.email({
							name: fullName,
							email: data.email,
							password: data.password,
							callbackURL: clientEnv.NEXT_PUBLIC_CALLBACK_URL,
						});

						// Handle profile image if provided
						if (data.image) {
							try {
								// TODO: Implement profile image upload
								console.log("Profile image will be uploaded:", data.image);
								toast.info("Profile image upload will be supported soon!");
							} catch (error) {
								console.error("Failed to upload profile image:", error);
								toast.warning("Profile picture couldn't be uploaded. You can add it later in settings.");
							}
						}

						router.push("/app");
					})(),
					{
						loading: "Creating your account...",
						success: `Welcome to Nimbus, ${fullName}!`,
						error: error => {
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

							return errorMessage;
						},
					}
				);
			} catch (error) {
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

				setState({ isLoading: false, error: errorMessage });
				throw error;
			} finally {
				setState(prev => ({ ...prev, isLoading: false }));
			}
		},
		[router]
	);

	return {
		...state,
		signUpWithCredentials,
		signInWithGoogleProvider,
	};
};

export const useSignOut = () => {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	const signOut = useCallback(async () => {
		setIsLoading(true);
		try {
			toast.promise(
				authClient.signOut({
					fetchOptions: {
						onSuccess: () => {
							router.push("/");
							router.refresh();
						},
						onError: ctx => {
							throw ctx.error;
						},
					},
				}),
				{
					loading: "Signing you out...",
					success: "Signed out successfully",
					error: error => (error instanceof Error ? error.message : "Sign out failed"),
				}
			);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Sign out failed";
			toast.error(errorMessage);
		} finally {
			setIsLoading(false);
		}
	}, [router]);

	return {
		signOut,
		isLoading,
	};
};

const checkEmailExists = async (email: string): Promise<{ exists: boolean }> => {
	const response = await axios.post(`${clientEnv.NEXT_PUBLIC_BACKEND_URL}/api/auth/check-email`, { email });
	return response.data;
};

export const useCheckEmailExists = () => {
	return useMutation({
		mutationFn: checkEmailExists,
		mutationKey: ["checkEmail"],
	});
};

export const useForgotPassword = () => {
	const [state, setState] = useState<AuthState>({ isLoading: false, error: null });

	const sendResetEmail = useCallback(async (data: ForgotPasswordFormData) => {
		setState({ isLoading: true, error: null });

		try {
			toast.promise(
				authClient.forgetPassword({
					email: data.email,
					redirectTo: "/reset-password",
				}),
				{
					loading: "Sending reset link...",
					success: () => "If an account exists with this email, you will receive a password reset link.",
					error: err => err?.message ?? "Something went wrong. Please try again.",
				}
			);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Unexpected error occurred.";
			setState({ isLoading: false, error: errorMessage });
			toast.error(errorMessage);
			console.error("Forgot password error:", error);
		} finally {
			setState(prev => ({ ...prev, isLoading: false }));
		}
	}, []);

	return {
		...state,
		sendResetEmail,
	};
};

export const useResetPassword = () => {
	const router = useRouter();
	const [state, setState] = useState<AuthState>({ isLoading: false, error: null });

	const resetPassword = useCallback(
		async (data: ResetPasswordFormData, token: string) => {
			if (!token) {
				throw new Error("Reset token is expired");
			}
			setState({ isLoading: true, error: null });

			try {
				toast.promise(
					authClient.resetPassword({
						newPassword: data.password,
						token: token,
					}),
					{
						loading: "Resetting password...",
						success: () => {
							router.push("/signin");
							return "Password reset successful. Login to continue.";
						},
						error: err => err?.message || "Something went wrong while resetting password.",
					}
				);
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : "Something went wrong while resetting password.";
				setState({ isLoading: false, error: errorMessage });
				console.error("Reset password error:", error);
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

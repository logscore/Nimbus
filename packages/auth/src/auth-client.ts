import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
	callbackUrl: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/dashboard`,
});

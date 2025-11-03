import { genericOAuthClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { polarClient } from "@polar-sh/better-auth";
import env from "@nimbus/env/client";

export const authClient = createAuthClient({
	baseURL: env.VITE_BACKEND_URL,
	callbackUrl: `${env.VITE_FRONTEND_URL}/dashboard`,
	plugins: [genericOAuthClient(), polarClient()],
});

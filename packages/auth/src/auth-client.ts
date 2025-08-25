import { genericOAuthClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import env from "@nimbus/env/client";

export const authClient = createAuthClient({
	baseURL: env.NEXT_PUBLIC_BACKEND_URL,
	callbackUrl: `${env.NEXT_PUBLIC_FRONTEND_URL}/dashboard`,
	plugins: [genericOAuthClient()],
});

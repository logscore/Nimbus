import { genericOAuthClient } from "better-auth/client/plugins";
import { stripeClient } from "@better-auth/stripe/client";
import { createAuthClient } from "better-auth/react";
import env from "@nimbus/env/client";

export const authClient = createAuthClient({
	baseURL: env.VITE_BACKEND_URL,
	callbackUrl: `${env.VITE_FRONTEND_URL}/dashboard`,
	plugins: [
		genericOAuthClient(),
		stripeClient({
			subscription: true, //if you want to enable subscription management
		}),
	],
});

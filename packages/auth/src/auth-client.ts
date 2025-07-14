import { createAuthClient } from "better-auth/react";
import env from "@nimbus/env/client";

export const BASE_CALLBACK_URL = `${env.NEXT_PUBLIC_FRONTEND_URL}/app`;

export const authClient = createAuthClient({
	baseURL: env.NEXT_PUBLIC_BACKEND_URL,
	callbackUrl: BASE_CALLBACK_URL,
});

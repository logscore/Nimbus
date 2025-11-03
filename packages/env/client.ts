import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

const env = createEnv({
	runtimeEnv: {
		VITE_BACKEND_URL: import.meta.env.VITE_BACKEND_URL,
		VITE_FRONTEND_URL: import.meta.env.VITE_FRONTEND_URL,
		VITE_POSTHOG_KEY: import.meta.env.VITE_POSTHOG_KEY,
		VITE_POSTHOG_HOST: import.meta.env.VITE_POSTHOG_HOST,
	},

	clientPrefix: "VITE_",
	client: {
		// Client-side environment variables
		VITE_BACKEND_URL: z.url(),
		VITE_FRONTEND_URL: z.url(),
		VITE_POSTHOG_KEY: z.string().optional(),
		VITE_POSTHOG_HOST: z.string().optional(),
	},
});

export default env;

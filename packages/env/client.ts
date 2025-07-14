import { createEnv } from "@t3-oss/env-core";
import BASE_ENV from "./base";
import { z } from "zod";

export const env = createEnv({
	...BASE_ENV,
	runtimeEnv: {
		NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
		NEXT_PUBLIC_FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL,
	},
	clientPrefix: "NEXT_PUBLIC_",
	client: {
		// Client-side environment variables
		NEXT_PUBLIC_BACKEND_URL: z.url(),
		NEXT_PUBLIC_FRONTEND_URL: z.url(),
	},
});

// Export the typed environment variables
export default env;

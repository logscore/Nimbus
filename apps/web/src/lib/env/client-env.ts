import { createEnv } from "@t3-oss/env-core";
import z from "zod";

export const clientEnv = createEnv({
	clientPrefix: "NEXT_PUBLIC_",
	client: {
		NEXT_PUBLIC_BACKEND_URL: z
			.string({ message: "The NEXT_PUBLIC_BACKEND_URL environment variable is required." })
			.url("NEXT_PUBLIC_BACKEND_URL must be a valid URL (e.g., https://api.yourdomain.com)."),
		NEXT_PUBLIC_FRONTEND_URL: z
			.string({ message: "The NEXT_PUBLIC_FRONTEND_URL environment variable is required." })
			.url("NEXT_PUBLIC_FRONTEND_URL must be a valid URL (e.g., https://yourdomain.com)"),
		NEXT_PUBLIC_CALLBACK_URL: z
			.string({ message: "The NEXT_PUBLIC_CALLBACK_URL environment variable is required." })
			.url("NEXT_PUBLIC_CALLBACK_URL must be a valid URL (e.g., https://yourdomain.com)."),
	},
	runtimeEnv: {
		NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
		NEXT_PUBLIC_CALLBACK_URL: process.env.NEXT_PUBLIC_CALLBACK_URL,
		NEXT_PUBLIC_FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL,
	},
});

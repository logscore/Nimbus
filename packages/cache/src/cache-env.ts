import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const cacheEnv = createEnv({
	server: {
		VALKEY_PORT: z.coerce
			.number({ message: "The VALKEY_PORT environment variable is required." })
			.min(1, "VALKEY_PORT must be a valid port number between 1 and 65535.")
			.max(65535, "VALKEY_PORT must be a valid port number between 1 and 65535."),

		VALKEY_HOST: z.string({ message: "The VALKEY_HOST environment variable is required." }),

		VALKEY_USERNAME: z.string({ message: "The VALKEY_USERNAME environment variable is required." }),

		VALKEY_PASSWORD: z.string({ message: "The VALKEY_PASSWORD environment variable is required." }),
	},
	runtimeEnv: process.env,
	emptyStringAsUndefined: true,
});

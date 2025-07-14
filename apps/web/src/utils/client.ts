import { createClient } from "@nimbus/client";

export const publicClient = createClient();
export const protectedClient = createClient({
	init: {
		credentials: "include",
	},
});

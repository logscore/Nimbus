import { createClient } from "@nimbus/client";

export const publicClient = createClient();
// add providerId and accountId based on context
export const protectedClient = createClient({
	init: {
		credentials: "include",
	},
});

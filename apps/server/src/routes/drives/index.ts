import { getDriveManagerForUser } from "@/providers";
import { getAccount } from "@/lib/utils/accounts";
import type { ApiResponse } from "@/routes/types";
import type { Context } from "hono";
import { Hono } from "hono";

const drivesRouter = new Hono();

// Get drive storage info
drivesRouter.get("/about", async (c: Context) => {
	try {
		const user = c.get("user");

		const drive = await getDriveManagerForUser(user, c.req.raw.headers);
		const driveInfo = await drive.getDriveInfo();

		if (!driveInfo) {
			return c.json<ApiResponse>({ success: false, message: "Drive data not found" }, 404);
		}

		return c.json(driveInfo);
	} catch (error) {
		console.error("Error fetching drive info:", error);
		return c.json<ApiResponse>(
			{ success: false, message: error instanceof Error ? error.message : "Failed to fetch drive information" },
			500
		);
	}
});

export default drivesRouter;

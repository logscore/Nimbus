import { createProtectedRouter, getSessionUserFromContext } from "@/hono";
import { getDriveProvider } from "@/providers";
import { sendError } from "../utils";

const drivesRouter = createProtectedRouter();

// Get drive storage info
drivesRouter.get("/about", async c => {
	try {
		const user = getSessionUserFromContext(c);

		const drive = await getDriveProvider(user ?? null, c.req.raw.headers);
		const driveInfo = await drive.getDriveInfo();

		if (!driveInfo) {
			return sendError(c, { message: "Drive data not found", status: 404 });
		}

		return c.json(driveInfo);
	} catch (error) {
		console.error("Error fetching drive info:", error);
		return sendError(c);
	}
});

export default drivesRouter;

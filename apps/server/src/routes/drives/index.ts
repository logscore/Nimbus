import { getDriveProvider } from "@/providers";
import { createProtectedRouter } from "@/hono";
import { sendError } from "../utils";

const drivesRouter = createProtectedRouter()
	// Get drive storage info
	.get("/about", async c => {
		try {
			const user = c.var.user;

			const drive = await getDriveProvider(user, c.req.raw.headers);
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

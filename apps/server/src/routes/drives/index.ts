import { getDriveProvider } from "../../providers";
import { createProtectedRouter } from "../../hono";
import { sendError, sendSuccess } from "../utils";

const drivesRouter = createProtectedRouter()
	// Get drive storage info
	.get("/about", async c => {
		try {
			const user = c.var.user;

			const drive = await getDriveProvider(user, c.req.raw.headers);
			const data = await drive.getDriveInfo();

			if (!data) {
				return sendError(c, { message: "Drive data not found", status: 404 });
			}

			return sendSuccess(c, { data });
		} catch (error) {
			console.error("Error fetching drive info:", error);
			return sendError(c);
		}
	});

export default drivesRouter;

import { createDriveProviderRouter } from "../../hono";
import { sendError, sendSuccess } from "../utils";

const drivesRouter = createDriveProviderRouter()
	// Get drive storage info
	.get("/about", async c => {
		try {
			const drive = c.var.provider;
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

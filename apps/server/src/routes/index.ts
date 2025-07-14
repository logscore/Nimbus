import { createProtectedRouter, createPublicRouter } from "@/hono";
import { createAuth } from "@nimbus/auth/auth";
import waitlistRoutes from "@/routes/waitlist";
import drivesRoutes from "@/routes/drives";
import filesRoutes from "@/routes/files";
import emailRoutes from "@/routes/email";
import tagsRoutes from "@/routes/tags";
import authRoutes from "@/routes/auth";
import { sendError } from "./utils";

// Create protected router with auth middleware
const protectedRouter = createProtectedRouter()
	.use("*", async (c, next) => {
		const auth = createAuth();
		const session = await auth.api.getSession({ headers: c.req.raw.headers });
		const user = session?.user;
		if (!user) {
			return sendError(c, { message: "Unauthorized", status: 401 });
		}
		c.set("user", user);
		c.set("auth", auth);
		return next();
	})
	.route("/files", filesRoutes)
	.route("/drives", drivesRoutes)
	.route("/tags", tagsRoutes);

// Create public router for unauthenticated routes
const publicRouter = createPublicRouter()
	.route("/auth", authRoutes)
	.route("/waitlist", waitlistRoutes)
	.route("/email", emailRoutes);

// Combine all routes under /api
const routes = createPublicRouter().route("/", protectedRouter).route("/", publicRouter);

// Export the main routes as default
export default routes;

// Export individual routers for testing or other purposes
export { protectedRouter, publicRouter };

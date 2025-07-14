import { createProtectedRouter, createPublicRouter } from "@/hono";
import waitlistRoutes from "@/routes/waitlist";
import drivesRoutes from "@/routes/drives";
import filesRoutes from "@/routes/files";
import emailRoutes from "@/routes/email";
import tagsRoutes from "@/routes/tags";
import authRoutes from "@/routes/auth";
import { sendError } from "./utils";

const protectedRoutePaths = ["/files", "/drives", "/tags"] as const;
const protectedRouteRouters = [filesRoutes, drivesRoutes, tagsRoutes] as const;
const publicRoutePaths = ["/auth", "/waitlist", "/email"] as const;
const publicRouteRouters = [authRoutes, waitlistRoutes, emailRoutes] as const;

if (
	publicRoutePaths.length !== publicRouteRouters.length ||
	protectedRoutePaths.length !== protectedRouteRouters.length
) {
	throw new Error("Route paths and routers do not match");
}

const protectedRouter = createProtectedRouter()
	.use("*", async (c, next) => {
		const session = await c.var.auth.api.getSession({ headers: c.req.raw.headers });
		const user = session?.user;
		if (!user) {
			return sendError(c, { message: "Unauthorized", status: 401 });
		}
		c.set("user", user);
		return next();
	})
	.route(protectedRoutePaths[0], protectedRouteRouters[0])
	.route(protectedRoutePaths[1], protectedRouteRouters[1])
	.route(protectedRoutePaths[2], protectedRouteRouters[2]);

const routes = createPublicRouter()
	.route(publicRoutePaths[0], publicRouteRouters[0])
	.route(publicRoutePaths[1], publicRouteRouters[1])
	.route(publicRoutePaths[2], publicRouteRouters[2])
	.route("/", protectedRouter);

export default routes;

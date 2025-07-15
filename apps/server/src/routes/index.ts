import { createProtectedRouter, createPublicRouter } from "../hono";
import waitlistRoutes from "./waitlist";
import drivesRoutes from "./drives";
import { sendError } from "./utils";
import filesRoutes from "./files";
import tagsRoutes from "./tags";
import authRoutes from "./auth";

const protectedRoutePaths = ["/files", "/drives", "/tags"] as const;
const protectedRouteRouters = [filesRoutes, drivesRoutes, tagsRoutes] as const;
const publicRoutePaths = ["/auth", "/waitlist"] as const;
const publicRouteRouters = [authRoutes, waitlistRoutes] as const;

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
	.route("/", protectedRouter);

export default routes;

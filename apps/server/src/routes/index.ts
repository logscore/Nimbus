import waitlistRoutes from "@/routes/waitlist";
import drivesRoutes from "@/routes/drives";
import type { Context, Next } from "hono";
import filesRoutes from "@/routes/files";
import emailRoutes from "@/routes/email";
import tagsRoutes from "@/routes/tags";
import authRoutes from "@/routes/auth";
import { Hono } from "hono";

const router = new Hono();

async function authCheck(c: Context, next: Next) {
	const user = c.get("user");
	if (!user) {
		return c.json({ success: false, message: "Unauthorized" }, 401);
	}
	await next();
}

// Authenticated routes. Add auth check middleware
router.use("/files/*", authCheck);
router.use("/drives/*", authCheck);
router.use("/tags/*", authCheck);

router.route("/files", filesRoutes);
router.route("/drives", drivesRoutes);
router.route("/tags", tagsRoutes);

router.route("/auth", authRoutes);
router.route("/waitlist", waitlistRoutes);
router.route("/email", emailRoutes);

export default router;

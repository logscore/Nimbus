// import { Redis as UpstashRedis } from "@upstash/redis/cloudflare";
// import { Redis as ValkeyRedis } from "iovalkey";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { extractTokenFromUrl } from "@/utils/extract-token";
import { sendMail } from "@/utils/send-mail";
import { betterAuth } from "better-auth";
import schema from "@nimbus/db/schema";
import { createDb } from "@nimbus/db";
import env from "@nimbus/env";

// import redisClient, { isEdge } from "@nimbus/cache";

export const createAuth = () => {
	// const cache = redisClient;
	const db = createDb(env.DATABASE_URL);
	return betterAuth({
		baseURL: env.BACKEND_URL,
		// Experimental cache storage of auth data
		// secondaryStorage: {
		// 	get: async (key: string) => {
		// 		return await cache.get(key);
		// 	},
		// 	set: async (key: string, value: string, ttl?: number) => {
		// 		if (ttl) {
		// 			if (isEdge) {
		// 				await (cache as UpstashRedis).set(key, value, { ex: ttl });
		// 			} else {
		// 				await (cache as ValkeyRedis).set(key, value, "EX", ttl);
		// 			}
		// 		} else {
		// 			await cache.set(key, value);
		// 		}
		// 	},
		// 	delete: async (key: string) => {
		// 		await cache.del(key);
		// 	},
		// },
		// advanced: {
		// 	crossSubDomainCookies: {
		// 		enabled: true,
		// 	},
		// },
		database: drizzleAdapter(db, {
			provider: "pg",
			schema: {
				...schema,
			},
		}),
		account: {
			accountLinking: {
				enabled: true,
			},
		},

		trustedOrigins: [env.FRONTEND_URL, env.BACKEND_URL],

		emailAndPassword: {
			enabled: true,
			autoSignIn: true,
			minPasswordLength: 8,
			maxPasswordLength: 100,
			resetPasswordTokenExpiresIn: 600, // 10 minutes
			sendResetPassword: async ({ user, url }) => {
				const token = extractTokenFromUrl(url);
				const frontendResetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`;

				await sendMail({
					to: user.email,
					subject: "Reset your password",
					text: `Click the link to reset your password: ${frontendResetUrl}`,
				});
			},
		},

		socialProviders: {
			google: {
				clientId: env.GOOGLE_CLIENT_ID as string,
				clientSecret: env.GOOGLE_CLIENT_SECRET as string,
				scope: [
					"https://www.googleapis.com/auth/drive",
					"https://www.googleapis.com/auth/userinfo.profile",
					"https://www.googleapis.com/auth/userinfo.email",
				],
				accessType: "offline",
				prompt: "consent",
			},

			microsoft: {
				clientId: env.MICROSOFT_CLIENT_ID as string,
				clientSecret: env.MICROSOFT_CLIENT_SECRET as string,
				scope: ["https://graph.microsoft.com/User.Read", "https://graph.microsoft.com/Files.ReadWrite.All"],
				tenantId: "common",
				prompt: "select_account",
			},
		},
	});
};

export type Auth = ReturnType<typeof createAuth>;
export type SessionUser = NonNullable<Awaited<ReturnType<Auth["api"]["getSession"]>>>["user"];

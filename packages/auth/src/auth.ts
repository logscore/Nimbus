import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { extractTokenFromUrl } from "@/utils/extract-token";
import { sendMail } from "@/utils/send-mail";
import { betterAuth } from "better-auth";
import schema from "@nimbus/db/schema";
import { createDb } from "@nimbus/db";
import env from "@nimbus/env";

export const createAuth = () =>
	betterAuth({
		baseURL: env.BACKEND_URL,
		// Ensure state is properly handled
		state: {
			encryption: true, // Enable state encryption
			ttl: 600, // 10 minutes state TTL
		},
		database: drizzleAdapter(createDb(env.DATABASE_URL), {
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

export type Auth = ReturnType<typeof createAuth>;
export type SessionUser = NonNullable<Awaited<ReturnType<Auth["api"]["getSession"]>>>["user"];

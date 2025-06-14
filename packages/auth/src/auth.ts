import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { extractTokenFromUrl } from "@/utils/extract-token";
import { sendMail } from "@/utils/send-mail";
import { betterAuth } from "better-auth";
import schema from "@nimbus/db/schema";
import { db } from "@nimbus/db";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: {
			...schema,
		},
	}),

	trustedOrigins: [process.env.FRONTEND_URL!, process.env.BACKEND_URL!],

	emailAndPassword: {
		enabled: true,
		autoSignIn: true,
		minPasswordLength: 8,
		maxPasswordLength: 100,
		resetPasswordTokenExpiresIn: 600, // 10 minutes
		sendResetPassword: async ({ user, url }) => {
			const token = extractTokenFromUrl(url);
			const frontendResetUrl = `${process.env.FRONTEND_URL!}/reset-password?token=${token}`;

			await sendMail({
				to: user.email,
				subject: "Reset your password",
				text: `Click the link to reset your password: ${frontendResetUrl}`,
			});
		},
	},

	socialProviders: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
			scope: [
				"https://www.googleapis.com/auth/drive",
				"https://www.googleapis.com/auth/userinfo.profile",
				"https://www.googleapis.com/auth/userinfo.email",
			],
			accessType: "offline",
			prompt: "consent",
		},
	},
});

export type Session = typeof auth.$Infer.Session;

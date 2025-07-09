import { afterAccountCreation, beforeSessionCreation } from "./databaseHooks";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { extractTokenFromUrl } from "./utils/extract-token";
import { multiSession } from "better-auth/plugins";
import { providerSchema } from "@nimbus/shared";
import redisClient from "@nimbus/cache/valkey";
import { sendMail } from "./utils/send-mail";
import { betterAuth } from "better-auth";
import schema from "@nimbus/db/schema";
import { db } from "@nimbus/db";

// TODO(shared): move constants to shared package. use in validation.

if (!process.env.FRONTEND_URL || !process.env.BACKEND_URL) {
	throw new Error("Missing environment variables. FRONTEND_URL or BACKEND_URL is not defined");
}

export const auth = betterAuth({
	appName: "Nimbus",
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: {
			...schema,
		},
	}),
	plugins: [multiSession()],
	trustedOrigins: [process.env.FRONTEND_URL, process.env.BACKEND_URL],

	// emailVerification: {
	// 	sendVerificationEmail: async ({ user, url, token }) => {
	// 		// TODO: Send verification email to user
	// 	},
	// 	sendOnSignUp: true,
	// 	autoSignInAfterVerification: true,
	// 	expiresIn: 3600, // 1 hour
	// },

	emailAndPassword: {
		enabled: true,
		autoSignIn: true,
		// requireEmailVerification: true,
		minPasswordLength: 8,
		maxPasswordLength: 100,
		resetPasswordTokenExpiresIn: 600, // 10 minutes
		sendResetPassword: async ({ user, url }) => {
			const token = extractTokenFromUrl(url);
			const frontendResetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

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

		microsoft: {
			clientId: process.env.MICROSOFT_CLIENT_ID as string,
			clientSecret: process.env.MICROSOFT_CLIENT_SECRET as string,
			scope: [
				"https://graph.microsoft.com/User.Read",
				"https://graph.microsoft.com/Files.ReadWrite.All",
				"email",
				"profile",
				"openid",
				"offline_access",
			],
			tenantId: "common",
			prompt: "select_account",
		},
	},

	// https://www.better-auth.com/docs/reference/options#user
	user: {
		additionalFields: {
			defaultProviderId: {
				type: "string",
				fieldName: "default_provider_id",
				input: true,
				returned: true,
				required: false,
				unique: false,
				validator: {
					input: providerSchema,
					output: providerSchema,
				},
				// sortable: true,
			},
		},
		changeEmail: {
			enabled: true,
			sendChangeEmailVerification: async ({ user, newEmail, url, token }) => {
				// Send change email verification
			},
		},
		deleteUser: {
			enabled: true,
			sendDeleteAccountVerification: async ({ user, url, token }) => {
				// Send delete account verification
			},
			beforeDelete: async user => {
				// Perform actions before user deletion
			},
			afterDelete: async user => {
				// Perform cleanup after user deletion
			},
		},
	},

	session: {
		additionalFields: {
			providerId: {
				type: "string",
				fieldName: "provider_id",
				input: false,
				returned: true,
				required: true,
				unique: false,
				validator: {
					input: providerSchema,
					output: providerSchema,
				},
				// sortable: true,
			},
		},
	},

	account: {
		accountLinking: {
			enabled: true,
			allowDifferentEmails: true,
		},
	},

	// https://www.better-auth.com/docs/reference/options#databasehooks
	databaseHooks: {
		account: {
			create: {
				after: afterAccountCreation,
			},
		},
		session: {
			create: {
				before: beforeSessionCreation,
			},
		},
	},

	secondaryStorage: {
		get: async key => {
			const value = await redisClient.get(key);
			return value ? value : null;
		},
		set: async (key, value, ttl) => {
			if (ttl) await redisClient.set(key, value, "EX", ttl);
			else await redisClient.set(key, value);
		},
		delete: async key => {
			await redisClient.del(key);
		},
	},
});

type Session = typeof auth.$Infer.Session;
export type SessionUser = Session["user"];

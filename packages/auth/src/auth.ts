import { drizzleAdapter } from "better-auth/adapters/drizzle";
import schema, { user as userTable } from "@nimbus/db/schema";
import { extractTokenFromUrl } from "./utils/extract-token";
import { type Account, betterAuth } from "better-auth";
import { sendMail } from "./utils/send-mail";
import redisClient from "@nimbus/cache";
import { createDb } from "@nimbus/db";
import env from "@nimbus/env/server";
import { eq } from "drizzle-orm";

// TODO(shared): move constants to shared package. use in validation.

const db = createDb(env.DATABASE_URL);

export const createAuth = () =>
	betterAuth({
		appName: "Nimbus",
		baseURL: env.BACKEND_URL,

		// Ensure state is properly handled
		state: {
			encryption: true, // Enable state encryption
			ttl: 600, // 10 minutes state TTL
		},

		database: drizzleAdapter(db, {
			provider: "pg",
			schema: {
				...schema,
			},
		}),

		trustedOrigins: [env.FRONTEND_URL, env.BACKEND_URL],

		emailAndPassword: {
			enabled: true,
			autoSignIn: true,
			minPasswordLength: 8,
			maxPasswordLength: 100,
			resetPasswordTokenExpiresIn: 600, // 10 minutes
			// requireEmailVerification: true,
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

		// emailVerification: {
		// 	sendVerificationEmail: async ({ user, url, token }) => {
		// 		// TODO: Send verification email to user
		// 	},
		// 	sendOnSignUp: true,
		// 	autoSignInAfterVerification: true,
		// 	expiresIn: 3600, // 1 hour
		// },

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

		secondaryStorage: {
			get: async (key: string): Promise<string | null> => {
				const value = await redisClient.get(key);
				const returnValue = value ? String(value) : null;
				return returnValue;
			},
			set: async (key: string, value: string, ttl?: number): Promise<void> => {
				if (ttl) await redisClient.set(key, value, { ex: ttl });
				else await redisClient.set(key, value);
			},
			delete: async (key: string): Promise<void> => {
				await redisClient.del(key);
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
					// broken with zod v4
					// validator: {
					// 	input: providerSchema,
					// 	output: providerSchema,
					// },
					// sortable: true,
				},
				defaultAccountId: {
					type: "string",
					fieldName: "default_account_id",
					input: true,
					returned: true,
					required: false,
					unique: false,
					// TODO: verify that account exists in database
					// validator: {
					// 	input: ,
					// 	output: textSchema,
					// },
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

		account: {
			accountLinking: {
				enabled: true,
				allowDifferentEmails: true,
				allowUnlinkingAll: true,
				updateUserInfoOnLink: true,
			},
		},

		hooks: {},

		// https://www.better-auth.com/docs/reference/options#databasehooks
		databaseHooks: {
			account: {
				create: {
					after: afterAccountCreation,
				},
			},
		},
	});

export type Auth = ReturnType<typeof createAuth>;
export type AuthSession = NonNullable<Awaited<ReturnType<Auth["api"]["getSession"]>>>;
export type Session = AuthSession["session"];
export type SessionUser = AuthSession["user"];

async function afterAccountCreation(account: Account) {
	const user = await db.query.user.findFirst({
		where: (table, { eq }) => eq(table.id, account.userId),
	});

	if (!user || user.defaultProviderId) {
		return;
	}

	const defaultProviderId = account.providerId;

	await db.update(userTable).set({ defaultProviderId }).where(eq(userTable.id, account.userId));
}

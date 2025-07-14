// import type { Redis as UpstashRedis } from "@upstash/redis/cloudflare";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import schema, { user as userTable } from "@nimbus/db/schema";
import { type Account, betterAuth } from "better-auth";
// import type { Redis as ValkeyRedis } from "iovalkey";
import env /*, { isEdge }*/ from "@nimbus/env/server";
// import { providerSchema } from "@nimbus/shared";
import { sendMail } from "./utils/send-mail";
// import redisClient from "@nimbus/cache";
import { createDb } from "@nimbus/db";
import { eq } from "drizzle-orm";

// TODO(shared): move constants to shared package. use in validation.

const db = createDb(env.DATABASE_URL);

export const createAuth = () => {
	return betterAuth({
		appName: "Nimbus",
		baseURL: env.BACKEND_URL,
		trustedOrigins: [env.FRONTEND_URL, env.BACKEND_URL],

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

		emailAndPassword: {
			enabled: true,
			autoSignIn: true,
			minPasswordLength: 8,
			maxPasswordLength: 100,
			resetPasswordTokenExpiresIn: 600, // 10 minutes
			requireEmailVerification: true,
			sendResetPassword: async ({ user, token }) => {
				const frontendResetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`;
				await sendMail({
					to: user.email,
					subject: "Reset your Nimbus password",
					text: `Click the link to reset your password: ${frontendResetUrl}`,
				});
			},
		},

		emailVerification: {
			sendVerificationEmail: async ({ user, url }) => {
				const urlParts = url.split(`${env.BACKEND_URL}/api/auth`);
				const emailUrl = `${env.FRONTEND_URL}${urlParts[1]}`;
				await sendMail({
					to: user.email,
					subject: "Verify your Nimbus email address",
					text: `Click the link to verify your email address: ${emailUrl}`,
				});
			},
			sendOnSignUp: true,
			autoSignInAfterVerification: true,
			expiresIn: 3600, // 1 hour
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

		// secondaryStorage: {
		// 	get: async (key: string) => {
		// 		return await redisClient.get(key);
		// 	},
		// 	set: async (key: string, value: string, ttl?: number) => {
		// 		if (ttl) {
		// 			if (isEdge) {
		// 				await (redisClient as UpstashRedis).set(key, value, { ex: ttl });
		// 			} else {
		// 				await (redisClient as unknown as ValkeyRedis).set(key, value, "EX", ttl);
		// 			}
		// 		} else {
		// 			await redisClient.set(key, value);
		// 		}
		// 	},
		// 	delete: async (key: string) => {
		// 		await redisClient.del(key);
		// 	},
		// },

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
				sendChangeEmailVerification: async ({ user, newEmail, url }) => {
					console.log("sendChangeEmailVerification", { user, newEmail, url });
					const urlParts = url.split(`${env.BACKEND_URL}/api/auth`);
					const emailUrl = `${env.FRONTEND_URL}${urlParts[1]}`;
					await sendMail({
						to: user.email,
						subject: "Approve Nimbus email address change",
						text: `Someone tried to change your email address to: ${newEmail}.\nClick the link to approve your email address change: ${emailUrl}`,
					});
				},
			},
			deleteUser: {
				enabled: true,
				// TODO(test): make sure this works, add frontend page to handle delete accoun
				sendDeleteAccountVerification: async ({ user, url }) => {
					const urlParts = url.split(`${env.BACKEND_URL}/api/auth`);
					const emailUrl = `${env.FRONTEND_URL}${urlParts[1]}`;
					await sendMail({
						to: user.email,
						subject: "Request to delete your Nimbus account",
						text: `Click the link to delete your account: ${emailUrl}`,
					});
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

		advanced: {
			crossSubDomainCookies: {
				enabled: true,
			},
		},

		hooks: {
			// hook for allow unlinking all
			// hook for update user info on link based on preferences
		},

		// https://www.better-auth.com/docs/reference/options#databasehooks
		databaseHooks: {
			account: {
				create: {
					after: afterAccountCreation,
				},
			},
		},
	});
};

export type Auth = ReturnType<typeof createAuth>;
export type AuthSession = NonNullable<Awaited<ReturnType<Auth["api"]["getSession"]>>>;
export type Session = AuthSession["session"];
export type SessionUser = AuthSession["user"];

async function afterAccountCreation(account: Account) {
	const user = await db.query.user.findFirst({
		where: (table, { eq }) => eq(table.id, account.userId),
	});

	if (!user || user.defaultAccountId || user.defaultProviderId) {
		return;
	}

	const defaultAccountId = account.accountId;
	const defaultProviderId = account.providerId;

	await db.update(userTable).set({ defaultAccountId, defaultProviderId }).where(eq(userTable.id, account.userId));
}

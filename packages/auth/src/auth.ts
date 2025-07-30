import type { Redis as UpstashRedis } from "@upstash/redis/cloudflare";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import schema, { user as userTable } from "@nimbus/db/schema";
import { type Account, betterAuth } from "better-auth";
import type { Redis as ValkeyRedis } from "iovalkey";
import type { RedisClient } from "@nimbus/cache";
import { providerSchema } from "@nimbus/shared";
import type { Env } from "@nimbus/env/server";
import { sendMail } from "./utils/send-mail";
import { type DB } from "@nimbus/db";
import type { Resend } from "resend";
import { eq } from "drizzle-orm";

// TODO(shared): move constants to shared package. use in validation.
// TODO(rate-limiting): implement for auth

export const createAuth = (env: Env, db: DB, redisClient: RedisClient, resend: Resend) => {
	const emailContext = {
		from: env.EMAIL_FROM,
		resend,
	};

	return betterAuth({
		appName: "Nimbus",
		baseURL: env.BACKEND_URL,
		trustedOrigins: [...env.TRUSTED_ORIGINS, env.BACKEND_URL],

		// Ensure state is properly handled
		state: {
			encryption: true, // Enable state encryption
			ttl: 600, // 10 minutes state TTL
		},

		database: drizzleAdapter(db, {
			provider: "pg",
			schema,
		}),

		emailAndPassword: {
			enabled: true,
			autoSignIn: true,
			minPasswordLength: 8,
			maxPasswordLength: 100,
			resetPasswordTokenExpiresIn: 600, // 10 minutes
			requireEmailVerification: true,
			sendResetPassword: async ({ user, token: _token, url }) => {
				// const frontendResetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`;
				await sendMail(emailContext, {
					to: user.email,
					subject: "Reset your Nimbus password",
					text: `Click the link to reset your password: ${url}`,
				});
			},
		},

		emailVerification: {
			sendVerificationEmail: async ({ user, url }) => {
				// const urlParts = url.split(`${env.BACKEND_URL}/api/auth`);
				// const emailUrl = `${env.FRONTEND_URL}${urlParts[1]}`;
				await sendMail(emailContext, {
					to: user.email,
					subject: "Verify your Nimbus email address",
					text: `Click the link to verify your email address: ${url}`,
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

		secondaryStorage: {
			get: async (key: string) => {
				return await redisClient.get(key);
			},
			set: async (key: string, value: string, ttl?: number) => {
				if (ttl) {
					if (env.IS_EDGE_RUNTIME) {
						await (redisClient as UpstashRedis).set(key, value, { ex: ttl });
					} else {
						await (redisClient as ValkeyRedis).set(key, value, "EX", ttl);
					}
				} else {
					await redisClient.set(key, value);
				}
			},
			delete: async (key: string) => {
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
					// validator: {
					// 	input: providerSchema,
					// 	output: providerSchema,
					// },
				},
				defaultAccountId: {
					type: "string",
					fieldName: "default_account_id",
					input: true,
					returned: true,
					required: false,
					unique: false,
				},
			},
			changeEmail: {
				enabled: true,
				sendChangeEmailVerification: async ({ user, newEmail, url }) => {
					// const urlParts = url.split(`${env.BACKEND_URL}/api/auth`);
					// const emailUrl = `${env.FRONTEND_URL}${urlParts[1]}`;
					await sendMail(emailContext, {
						to: user.email,
						subject: "Approve Nimbus email address change",
						text: `Someone tried to change your email address to: ${newEmail}.\nClick the link to approve your email address change: ${url}`,
					});
				},
			},
			deleteUser: {
				enabled: true,
				// TODO(test): make sure this works, add frontend page to handle delete accoun
				sendDeleteAccountVerification: async ({ user, url }) => {
					// const urlParts = url.split(`${env.BACKEND_URL}/api/auth`);
					// const emailUrl = `${env.FRONTEND_URL}${urlParts[1]}`;
					await sendMail(emailContext, {
						to: user.email,
						subject: "Request to delete your Nimbus account",
						text: `Click the link to delete your account: ${url}`,
					});
				},
			},
		},

		account: {
			accountLinking: {
				enabled: true,
				allowDifferentEmails: true,
			},
			additionalFields: {
				nickname: {
					type: "string",
					fieldName: "nickname",
					input: true,
					returned: true,
					required: false,
					unique: true,
				},
			},
		},

		advanced: {
			crossSubDomainCookies: {
				enabled: true,
			},
			ipAddress: {
				ipAddressHeaders: env.IS_EDGE_RUNTIME ? ["cf-connecting-ip"] : undefined, // Cloudflare specific header example
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
					after: account => afterAccountCreation(db, account),
				},
			},
		},
	});
};

export type Auth = ReturnType<typeof createAuth>;
export type AuthSession = NonNullable<Awaited<ReturnType<Auth["api"]["getSession"]>>>;
export type SessionUser = AuthSession["user"];

async function afterAccountCreation(db: DB, account: Account) {
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

import { type Account, type AuthContext, betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import schema, { user as userTable } from "@nimbus/db/schema";
import { cacheClient, type CacheClient } from "@nimbus/cache";
// import { genericOAuth } from "better-auth/plugins";
import { sendMail } from "./utils/send-mail";
import { stripe } from "@better-auth/stripe";
import { env } from "@nimbus/env/server";
import { db, type DB } from "@nimbus/db";
import { eq } from "drizzle-orm";
import { Resend } from "resend";
import Stripe from "stripe";

const stripeClient = new Stripe(env.STRIPE_SECRET_KEY!, {
	apiVersion: "2025-08-27.basil",
});

// TODO(shared): move constants to shared package. use in validation.
// TODO(rate-limiting): implement for auth
const emailContext = {
	from: env.EMAIL_FROM!,
	resend: new Resend(env.RESEND_API_KEY),
};

export const auth = betterAuth({
	appName: "Nimbus",
	baseURL: env.BACKEND_URL,
	trustedOrigins: [...env.TRUSTED_ORIGINS, env.BACKEND_URL],
	telemetry: { enabled: false },
	onApiError: {
		// errorUrl: env.FRONTEND_URL,
		throwError: true,
		onError: (error: unknown, ctx: AuthContext) => {
			console.error("Auth API error", error, ctx);
		},
	},

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
			clientId: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET,
			scope: [
				"https://www.googleapis.com/auth/drive",
				"https://www.googleapis.com/auth/userinfo.profile",
				"https://www.googleapis.com/auth/userinfo.email",
			],
			accessType: "offline",
			// https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow#request-parameter-prompt
			prompt: "consent",
		},

		microsoft: {
			clientId: env.MICROSOFT_CLIENT_ID,
			clientSecret: env.MICROSOFT_CLIENT_SECRET,
			scope: [
				"https://graph.microsoft.com/User.Read",
				"https://graph.microsoft.com/Files.ReadWrite.All",
				"email",
				"profile",
				"openid",
				"offline_access",
			],
			tenantId: "common",
			// https://learn.microsoft.com/en-us/dynamics365/business-central/application/system-application/enum/system.security.authentication.prompt-interaction
			prompt: "select_account",
		},

		// dropbox: {
		// 	clientId: env.DROPBOX_CLIENT_ID as string,
		// 	clientSecret: env.DROPBOX_CLIENT_SECRET as string,
		// 	scope: ["files.metadata.read", "files.content.read", "files.content.write", "sharing.read"],
		// },
	},

	plugins: [
		stripe({
			stripeClient,
			stripeWebhookSecret: env.STRIPE_WEBHOOK_SECRET!,
			createCustomerOnSignUp: true,
		}),
		// 	genericOAuth({
		// 		config: [
		// 			{
		// 				providerId: "box",
		// 				clientId: env.BOX_CLIENT_ID,
		// 				clientSecret: env.BOX_CLIENT_SECRET,
		// 				authorizationUrl: "https://account.box.com/api/oauth2/authorize",
		// 				tokenUrl: "https://api.box.com/oauth2/token",
		// 				userInfoUrl: "https://api.box.com/2.0/users/me",
		// 				mapProfileToUser: profile => ({
		// 					id: profile.id,
		// 					name: profile.name,
		// 					email: profile.login,
		// 				}),
		// 				scopes: ["root_readwrite", "manage_app_users"],
		// 			},
		// 		],
		// 	}),
	],

	// secondaryStorage: {
	// 	// better-auth expects a JSON string
	// 	get: async (key: string) => {
	// 		const value = await (cacheClient as CacheClient).get(key);
	// 		return value;
	// 	},
	// 	set: async (key: string, value: string, ttl?: number) => {
	// 		if (ttl) {
	// 			await (cacheClient as CacheClient).set(key, value, "EX", ttl);
	// 		} else {
	// 			await cacheClient.set(key, value);
	// 		}
	// 	},
	// 	delete: async (key: string) => {
	// 		await cacheClient.del(key);
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
			enabled: false,
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
			ipAddressHeaders: undefined,
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

export type Auth = typeof auth;
export type AuthSession = NonNullable<Awaited<ReturnType<Auth["api"]["getSession"]>>>;
export type SessionUser = AuthSession["user"];

export async function afterAccountCreation(db: DB, account: Account) {
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

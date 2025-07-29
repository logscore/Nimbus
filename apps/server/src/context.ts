import { createRedisClient, type RedisClient } from "@nimbus/cache";
import { createAuth, type Auth } from "@nimbus/auth/auth";
import { createEnv, type Env } from "@nimbus/env/server";
import { createDb, type DB } from "@nimbus/db";
import type { PublicRouterVars } from "./hono";
import type { Context } from "hono";
import { Resend } from "resend";

export class ContextManager {
	private static instance: ContextManager;
	private _env: Env | undefined;
	private db: DB | undefined;
	private redisClient: RedisClient | undefined;
	private auth: Auth | undefined;
	private closeDb: (() => Promise<void>) | undefined;
	private closeRedisClient: (() => Promise<void>) | undefined;
	private resend: Resend | undefined;

	private constructor() {}

	public get env(): Env {
		return this.initializeEnv();
	}

	public static getInstance(): ContextManager {
		if (!ContextManager.instance) {
			ContextManager.instance = new ContextManager();
		}
		return ContextManager.instance;
	}

	private initializeEnv(c?: Context): Env {
		if (!this._env) {
			// Handle Cloudflare Workers environment variables
			if (c?.env) {
				Object.entries(c.env).forEach(([key, value]) => {
					if (typeof value === "string") {
						process.env[key] = value;
					}
				});
			}
			this._env = createEnv(process.env);
		}
		return this._env;
	}

	private async initializeDatabase(env: Env): Promise<void> {
		if (!this.db || !this.closeDb) {
			const { db, closeDb } = createDb(env);
			this.db = db;
			this.closeDb = closeDb;
		}
	}

	private initializeRedis(env: Env): void {
		if (!this.redisClient || !this.closeRedisClient) {
			const { redisClient, closeRedisClient } = createRedisClient(env);
			this.redisClient = redisClient;
			this.closeRedisClient = closeRedisClient;
		}
	}

	private initializeAuth(env: Env): void {
		if (!this.auth && this.db && this.redisClient) {
			this.resend = new Resend(env.RESEND_API_KEY);
			this.auth = createAuth(env, this.db, this.redisClient, this.resend);
		}
	}

	public async createContext(c?: Context): Promise<PublicRouterVars> {
		const env = this.env;

		await Promise.all([this.initializeDatabase(env), this.initializeRedis(env)]);

		this.initializeAuth(env);

		if (!this.db || !this.redisClient || !this.auth) {
			throw new Error("Failed to initialize application context");
		}

		return {
			env,
			db: this.db,
			redisClient: this.redisClient,
			auth: this.auth,
		};
	}

	public async close(): Promise<void> {
		const promises: Promise<void>[] = [];
		if (this.closeDb) promises.push(this.closeDb().catch(console.error));
		if (this.closeRedisClient) promises.push(this.closeRedisClient().catch(console.error));
		await Promise.all(promises);

		// Clear references
		this.db = undefined;
		this.redisClient = undefined;
		this.auth = undefined;
		this._env = undefined;
		this.closeDb = undefined;
		this.closeRedisClient = undefined;
		this.resend = undefined;
	}
}

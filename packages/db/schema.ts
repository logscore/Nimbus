import { boolean, foreignKey, index, pgTable, text, timestamp } from "drizzle-orm/pg-core";

const defaultTimestamp = (name: string) =>
	timestamp(name)
		.$defaultFn(() => /* @__PURE__ */ new Date())
		.notNull();

// Auth schema
export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified")
		.$defaultFn(() => false)
		.notNull(),
	image: text("image"),
	// references account.accountId and account.providerId. Is set via better-auth database hook after account creation
	defaultAccountId: text("default_account_id"),
	defaultProviderId: text("default_provider_id"),
	createdAt: defaultTimestamp("created_at"),
	updatedAt: defaultTimestamp("updated_at"),
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	token: text("token").notNull().unique(),
	expiresAt: timestamp("expires_at").notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	createdAt: defaultTimestamp("created_at"),
	updatedAt: defaultTimestamp("updated_at"),
});

export const account = pgTable(
	"account",
	{
		id: text("id").primaryKey(),
		accountId: text("account_id").notNull(),
		providerId: text("provider_id").notNull(),
		userId: text("user_id").notNull(),
		accessToken: text("access_token"),
		refreshToken: text("refresh_token"),
		idToken: text("id_token"),
		accessTokenExpiresAt: timestamp("access_token_expires_at"),
		refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
		scope: text("scope"),
		password: text("password"),
		nickname: text("nickname"),
		createdAt: defaultTimestamp("created_at"),
		updatedAt: defaultTimestamp("updated_at"),
	},
	table => [
		index("account_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "account_user_id_user_id_fk",
		}).onDelete("cascade"),
	]
);

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: defaultTimestamp("created_at"),
	updatedAt: defaultTimestamp("updated_at"),
});

// Tags schema
export const tag = pgTable(
	"tag",
	{
		id: text("id").primaryKey(),
		name: text("name").notNull(),
		color: text("color").notNull().default("#808080"), // Default grey color
		parentId: text("parent_id"),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		createdAt: defaultTimestamp("created_at"),
		updatedAt: defaultTimestamp("updated_at"),
	},
	table => [
		foreignKey({
			columns: [table.parentId],
			foreignColumns: [table.id],
			name: "tag_parent_id_tag_id_fk",
		}).onDelete("cascade"),
	]
);

// File-Tags junction table for many-to-many relationship
export const fileTag = pgTable("file_tag", {
	id: text("id").primaryKey(),
	// Can't use foreign key here since we don't store all files locally(example: external files from cloud providers)
	fileId: text("file_id").notNull(),
	tagId: text("tag_id")
		.notNull()
		.references(() => tag.id, { onDelete: "cascade" }),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	createdAt: defaultTimestamp("created_at"),
});

// Pinned Files schema
export const pinnedFile = pgTable("pinned_file", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	fileId: text("file_id").notNull(),
	name: text("name").notNull(),
	type: text("type").notNull().default("folder"),
	mimeType: text("mime_type"),
	provider: text("provider").notNull(),
	accountId: text("account_id").notNull(),
	createdAt: defaultTimestamp("created_at"),
	updatedAt: defaultTimestamp("updated_at"),
});

// Waitlist Schema
export const waitlist = pgTable("waitlist", {
	id: text("id").primaryKey(),
	email: text("email").notNull().unique(),
	createdAt: defaultTimestamp("created_at"),
});

const schema = {
	user,
	session,
	account,
	verification,
	tag,
	fileTag,
	pinnedFile,
	waitlist,
};

export type UserTableInsert = typeof user.$inferInsert;
export type UserTableSelect = typeof user.$inferSelect;
export type SessionTableInsert = typeof session.$inferInsert;
export type AccountTableSelect = typeof account.$inferSelect;
export type PinnedFileTableSelect = typeof pinnedFile.$inferSelect;

export default schema;

import { relations } from "drizzle-orm/relations";
import { tag, fileTag, user, account, session, pinnedFile } from "./schema";

export const fileTagRelations = relations(fileTag, ({one}) => ({
	tag: one(tag, {
		fields: [fileTag.tagId],
		references: [tag.id]
	}),
	user: one(user, {
		fields: [fileTag.userId],
		references: [user.id]
	}),
}));

export const tagRelations = relations(tag, ({one, many}) => ({
	fileTags: many(fileTag),
	tag: one(tag, {
		fields: [tag.parentId],
		references: [tag.id],
		relationName: "tag_parentId_tag_id"
	}),
	tags: many(tag, {
		relationName: "tag_parentId_tag_id"
	}),
	user: one(user, {
		fields: [tag.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	fileTags: many(fileTag),
	accounts: many(account),
	sessions: many(session),
	tags: many(tag),
	pinnedFiles: many(pinnedFile),
}));

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const pinnedFileRelations = relations(pinnedFile, ({one}) => ({
	user: one(user, {
		fields: [pinnedFile.userId],
		references: [user.id]
	}),
}));
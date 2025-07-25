CREATE TABLE "pinned_file" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"file_id" text NOT NULL,
	"name" text NOT NULL,
	"type" text DEFAULT 'folder' NOT NULL,
	"mime_type" text,
	"provider" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
DROP TABLE "pinned_folder" CASCADE;--> statement-breakpoint
ALTER TABLE "pinned_file" ADD CONSTRAINT "pinned_file_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
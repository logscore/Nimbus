ALTER TABLE "session" ADD COLUMN "provider_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "default_provider" text NOT NULL;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_provider_id_account_provider_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."account"("provider_id") ON DELETE no action ON UPDATE no action;
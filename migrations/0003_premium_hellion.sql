ALTER TABLE "user" ADD COLUMN "country" text DEFAULT 'us' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "market_digest_hour" integer DEFAULT 9 NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "market_digest_last_sent_date" text;
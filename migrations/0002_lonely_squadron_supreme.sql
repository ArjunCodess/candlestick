CREATE TABLE "price_alert" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"stock_symbol" text NOT NULL,
	"name" text NOT NULL,
	"condition" text NOT NULL,
	"threshold" double precision NOT NULL,
	"frequency" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_checked_at" timestamp,
	"last_triggered_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "alert_email" text;--> statement-breakpoint
ALTER TABLE "price_alert" ADD CONSTRAINT "price_alert_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_alert" ADD CONSTRAINT "price_alert_stock_symbol_stock_symbol_fk" FOREIGN KEY ("stock_symbol") REFERENCES "public"."stock"("symbol") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "priceAlert_userId_idx" ON "price_alert" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "priceAlert_stockSymbol_idx" ON "price_alert" USING btree ("stock_symbol");--> statement-breakpoint
CREATE INDEX "priceAlert_isActive_idx" ON "price_alert" USING btree ("is_active");
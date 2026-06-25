CREATE TABLE "stock" (
	"symbol" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "watchlist" (
	"user_id" text NOT NULL,
	"stock_symbol" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "watchlist_user_id_stock_symbol_pk" PRIMARY KEY("user_id","stock_symbol")
);
--> statement-breakpoint
ALTER TABLE "watchlist" ADD CONSTRAINT "watchlist_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watchlist" ADD CONSTRAINT "watchlist_stock_symbol_stock_symbol_fk" FOREIGN KEY ("stock_symbol") REFERENCES "public"."stock"("symbol") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "watchlist_userId_idx" ON "watchlist" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "watchlist_stockSymbol_idx" ON "watchlist" USING btree ("stock_symbol");
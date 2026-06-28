import { relations } from "drizzle-orm"
import {
  pgTable,
  text,
  timestamp,
  boolean,
  doublePrecision,
  integer,
  index,
  jsonb,
  primaryKey,
} from "drizzle-orm/pg-core"

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  alertEmail: text("alert_email"),
  country: text("country").default("us").notNull(),
  marketDigestHour: integer("market_digest_hour").default(9).notNull(),
  marketDigestLastSentDate: text("market_digest_last_sent_date"),
  dashboardSettings: jsonb("dashboard_settings"),
  dashboardSettingsSavedAt: timestamp("dashboard_settings_saved_at"),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
})

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)]
)

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)]
)

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)]
)

export const stock = pgTable("stock", {
  symbol: text("symbol").primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const watchlist = pgTable(
  "watchlist",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    stockSymbol: text("stock_symbol")
      .notNull()
      .references(() => stock.symbol, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.stockSymbol] }),
    index("watchlist_userId_idx").on(table.userId),
    index("watchlist_stockSymbol_idx").on(table.stockSymbol),
  ]
)

export const priceAlert = pgTable(
  "price_alert",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    stockSymbol: text("stock_symbol")
      .notNull()
      .references(() => stock.symbol, { onDelete: "cascade" }),
    name: text("name").notNull(),
    condition: text("condition").notNull(),
    threshold: doublePrecision("threshold").notNull(),
    frequency: text("frequency").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    lastCheckedAt: timestamp("last_checked_at"),
    lastTriggeredAt: timestamp("last_triggered_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("priceAlert_userId_idx").on(table.userId),
    index("priceAlert_stockSymbol_idx").on(table.stockSymbol),
    index("priceAlert_isActive_idx").on(table.isActive),
  ]
)

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  watchlist: many(watchlist),
  priceAlerts: many(priceAlert),
}))

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}))

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}))

export const stockRelations = relations(stock, ({ many }) => ({
  watchlist: many(watchlist),
  priceAlerts: many(priceAlert),
}))

export const watchlistRelations = relations(watchlist, ({ one }) => ({
  user: one(user, {
    fields: [watchlist.userId],
    references: [user.id],
  }),
  stock: one(stock, {
    fields: [watchlist.stockSymbol],
    references: [stock.symbol],
  }),
}))

export const priceAlertRelations = relations(priceAlert, ({ one }) => ({
  user: one(user, {
    fields: [priceAlert.userId],
    references: [user.id],
  }),
  stock: one(stock, {
    fields: [priceAlert.stockSymbol],
    references: [stock.symbol],
  }),
}))

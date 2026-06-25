"use server"

import { and, desc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { normalizeStockSymbol } from "@/lib/constants"
import { db } from "@/lib/db"
import { stock, watchlist } from "@/lib/db/schema"

async function getSession() {
  return auth.api.getSession({ headers: await headers() })
}

async function addStockToWatchlist(userId: string, symbol: string) {
  await db.insert(stock).values({ symbol }).onConflictDoNothing()
  await db
    .insert(watchlist)
    .values({ userId, stockSymbol: symbol })
    .onConflictDoNothing()
}

async function removeStockFromWatchlist(userId: string, symbol: string) {
  await db
    .delete(watchlist)
    .where(and(eq(watchlist.userId, userId), eq(watchlist.stockSymbol, symbol)))
}

export async function getWatchlistedStocks() {
  const session = await getSession()

  if (!session) {
    redirect("/sign-in?callbackURL=/watchlist")
  }

  return db
    .select({ symbol: stock.symbol })
    .from(watchlist)
    .innerJoin(stock, eq(watchlist.stockSymbol, stock.symbol))
    .where(eq(watchlist.userId, session.user.id))
    .orderBy(desc(watchlist.createdAt))
}

export async function getWatchlistedSymbols() {
  const session = await getSession()

  if (!session) {
    return []
  }

  const stocks = await db
    .select({ symbol: watchlist.stockSymbol })
    .from(watchlist)
    .where(eq(watchlist.userId, session.user.id))

  return stocks.map((savedStock) => savedStock.symbol)
}

export async function isStockWatchlisted(symbol: string) {
  const session = await getSession()

  if (!session) {
    return false
  }

  const normalizedSymbol = normalizeStockSymbol(symbol)
  const [savedStock] = await db
    .select({ symbol: watchlist.stockSymbol })
    .from(watchlist)
    .where(
      and(
        eq(watchlist.userId, session.user.id),
        eq(watchlist.stockSymbol, normalizedSymbol)
      )
    )
    .limit(1)

  return Boolean(savedStock)
}

export async function toggleWatchlist(
  symbol: string,
  shouldWatchlist: boolean,
  callbackPath = "/watchlist"
) {
  const normalizedSymbol = normalizeStockSymbol(symbol)
  const session = await getSession()

  if (!session) {
    redirect(`/sign-in?callbackURL=${encodeURIComponent(callbackPath)}`)
  }

  if (shouldWatchlist) {
    await addStockToWatchlist(session.user.id, normalizedSymbol)
  } else {
    await removeStockFromWatchlist(session.user.id, normalizedSymbol)
  }

  revalidatePath("/watchlist")
  revalidatePath(`/stock/${encodeURIComponent(normalizedSymbol)}`)

  return shouldWatchlist
}

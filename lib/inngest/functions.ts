import { and, eq } from "drizzle-orm"
import { cron } from "inngest"

import {
  formatAlertCondition,
  formatPrice,
  alertFrequencyLabels,
  isAlertCondition,
  isAlertFrequency,
  shouldCheckAlert,
  shouldSendAlert,
} from "@/lib/alerts"
import { db } from "@/lib/db"
import { priceAlert, user, watchlist } from "@/lib/db/schema"
import { inngest } from "@/lib/inngest/client"
import {
  type StockReview,
  sendAlertEmail,
  sendMarketDigestEmail,
} from "@/lib/mail"
import { getMarketDigestTimeZone } from "@/lib/market-digest"
import { getCountryBusinessHeadlines } from "@/lib/news"
import { getDisplayStockSymbol } from "@/lib/stock-symbols"
import { getStockQuote } from "../stocks"

function getLocalDate(now: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone,
    year: "numeric",
  }).format(now)
}

function getLocalHour(now: Date, timeZone: string) {
  return Number(
    new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      hourCycle: "h23",
      timeZone,
    }).format(now)
  )
}

function getBaseUrl() {
  return process.env.BETTER_AUTH_URL
}

function getReview(percentChange: number) {
  if (percentChange > 0.5) {
    return "Positive move"
  }

  if (percentChange < -0.5) {
    return "Negative move"
  }

  return "Flat move"
}

async function getStockReviews(userId: string) {
  const stocks = await db
    .select({ symbol: watchlist.stockSymbol })
    .from(watchlist)
    .where(eq(watchlist.userId, userId))

  const reviews: StockReview[] = []

  for (const stock of stocks) {
    const displaySymbol = getDisplayStockSymbol(stock.symbol)
    const url = `${getBaseUrl()}/stock/${encodeURIComponent(stock.symbol)}`
    const quote = await getStockQuote(stock.symbol).catch(() => null)

    reviews.push({
      change: quote?.change ?? null,
      percentChange: quote?.percentChange ?? null,
      price: quote?.price ?? null,
      review: quote ? getReview(quote.percentChange) : "Unavailable",
      symbol: displaySymbol,
      url,
    })
  }

  return reviews
}

export const checkPriceAlerts = inngest.createFunction(
  {
    id: "check-price-alerts",
    triggers: [cron("* * * * *")],
  },
  async ({ step }) => {
    return step.run("check active alerts", async () => {
      const now = new Date()
      const alerts = await db
        .select({
          id: priceAlert.id,
          name: priceAlert.name,
          stockSymbol: priceAlert.stockSymbol,
          condition: priceAlert.condition,
          threshold: priceAlert.threshold,
          frequency: priceAlert.frequency,
          lastCheckedAt: priceAlert.lastCheckedAt,
          lastTriggeredAt: priceAlert.lastTriggeredAt,
          recipientEmail: user.alertEmail,
          accountEmail: user.email,
        })
        .from(priceAlert)
        .innerJoin(user, eq(priceAlert.userId, user.id))
        .where(eq(priceAlert.isActive, true))

      const dueAlerts = alerts.filter((alert) => {
        if (
          !isAlertCondition(alert.condition) ||
          !isAlertFrequency(alert.frequency)
        ) {
          return false
        }

        return shouldCheckAlert(alert.frequency, alert.lastCheckedAt, now)
      })

      const symbols = Array.from(
        new Set(dueAlerts.map((alert) => alert.stockSymbol))
      )
      const quotes = new Map()

      for (const symbol of symbols) {
        quotes.set(symbol, await getStockQuote(symbol).catch(() => null))
      }

      let checked = 0
      let sent = 0

      for (const alert of dueAlerts) {
        if (
          !isAlertCondition(alert.condition) ||
          !isAlertFrequency(alert.frequency)
        ) {
          continue
        }

        const quote = quotes.get(alert.stockSymbol)

        if (!quote) {
          continue
        }

        const shouldSend = shouldSendAlert(
          alert.condition,
          quote.price,
          alert.threshold,
          alert.frequency,
          alert.lastTriggeredAt,
          now
        )

        if (shouldSend) {
          const displaySymbol = getDisplayStockSymbol(alert.stockSymbol)

          await sendAlertEmail({
            to: alert.recipientEmail ?? alert.accountEmail,
            subject: `Candlestick Alert: ${displaySymbol} target reached`,
            text: [
              `Your Candlestick price alert "${alert.name}" has triggered.`,
              "",
              `${displaySymbol} is now trading at ${formatPrice(quote.price)}.`,
              `Alert condition: ${formatAlertCondition(alert.condition, alert.threshold)}.`,
              `Move today: ${quote.percentChange >= 0 ? "+" : ""}${quote.percentChange.toFixed(2)}%.`,
              `Check frequency: ${alertFrequencyLabels[alert.frequency]}.`,
              `Checked at: ${now.toLocaleString("en-US", { timeZone: "UTC" })} UTC.`,
              "",
              "This email was sent because the current price crossed your saved threshold. Candlestick will keep watching this alert and will only send again after the selected frequency window allows it.",
            ].join("\n"),
          })

          sent += 1
        }

        await db
          .update(priceAlert)
          .set({
            lastCheckedAt: now,
            lastTriggeredAt: shouldSend ? now : alert.lastTriggeredAt,
          })
          .where(
            and(eq(priceAlert.id, alert.id), eq(priceAlert.isActive, true))
          )

        checked += 1
      }

      return { checked, sent }
    })
  }
)

export const sendMarketDigests = inngest.createFunction(
  {
    id: "send-market-digests",
    triggers: [cron("0 * * * *")],
  },
  async ({ step }) => {
    return step.run("send due digests", async () => {
      const now = new Date()
      const users = await db
        .select({
          id: user.id,
          email: user.email,
          alertEmail: user.alertEmail,
          country: user.country,
          marketDigestHour: user.marketDigestHour,
          marketDigestLastSentDate: user.marketDigestLastSentDate,
        })
        .from(user)

      let sent = 0

      for (const savedUser of users) {
        const timeZone = getMarketDigestTimeZone(savedUser.country)
        const localDate = getLocalDate(now, timeZone)

        if (
          savedUser.marketDigestLastSentDate === localDate ||
          savedUser.marketDigestHour !== getLocalHour(now, timeZone)
        ) {
          continue
        }

        const headlines = await getCountryBusinessHeadlines(savedUser.country)
        const stockReviews = await getStockReviews(savedUser.id)

        await sendMarketDigestEmail({
          headlines,
          stockReviews,
          to: savedUser.alertEmail ?? savedUser.email,
        })

        await db
          .update(user)
          .set({ marketDigestLastSentDate: localDate })
          .where(eq(user.id, savedUser.id))

        sent += 1
      }

      return { checked: users.length, sent }
    })
  }
)

export const functions = [checkPriceAlerts, sendMarketDigests]

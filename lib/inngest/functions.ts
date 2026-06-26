import { and, eq } from "drizzle-orm"
import { cron } from "inngest"

import {
  formatAlertCondition,
  formatPrice,
  isAlertCondition,
  isAlertFrequency,
  shouldCheckAlert,
  shouldSendAlert,
} from "@/lib/alerts"
import { db } from "@/lib/db"
import { priceAlert, user } from "@/lib/db/schema"
import { inngest } from "@/lib/inngest/client"
import { sendAlertEmail } from "@/lib/mail"
import { getDisplayStockSymbol, getStockQuote } from "../stocks"

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
            subject: `${displaySymbol} alert triggered`,
            text: [
              `${alert.name} triggered.`,
              "",
              `${displaySymbol} is now ${formatPrice(quote.price)}.`,
              `Alert: ${formatAlertCondition(alert.condition, alert.threshold)}`,
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

export const functions = [checkPriceAlerts]

import type { Metadata } from "next"

import { getPriceAlerts } from "@/actions/alerts"
import { AlertManager, type AlertCardItem } from "@/components/alert-manager"
import {
  isAlertCondition,
  isAlertFrequency,
  type AlertCondition,
  type AlertFrequency,
} from "@/lib/alerts"
import {
  getDisplayStockSymbol,
  getStockProfile,
  getStockQuote,
} from "@/lib/stocks"

export const metadata: Metadata = {
  title: "Alerts",
  description:
    "Create stock price alerts and receive Candlestick email notifications when targets are crossed.",
}

export default async function AlertPage() {
  const savedAlerts = await getPriceAlerts()
  const alerts = await Promise.all(
    savedAlerts.map(async (alert) => {
      if (
        !isAlertCondition(alert.condition) ||
        !isAlertFrequency(alert.frequency)
      ) {
        return null
      }

      const [profile, quote] = await Promise.all([
        getStockProfile(alert.stockSymbol).catch(() => ({
          name: getDisplayStockSymbol(alert.stockSymbol),
          logo: "",
        })),
        getStockQuote(alert.stockSymbol).catch(() => null),
      ])

      return {
        id: alert.id,
        name: alert.name,
        stockSymbol: alert.stockSymbol,
        condition: alert.condition as AlertCondition,
        threshold: alert.threshold,
        frequency: alert.frequency as AlertFrequency,
        profile,
        quote,
      } satisfies AlertCardItem
    })
  )

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <AlertManager
        alerts={alerts.filter((alert): alert is AlertCardItem =>
          Boolean(alert)
        )}
      />
    </div>
  )
}

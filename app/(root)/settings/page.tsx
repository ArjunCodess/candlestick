import type { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { getDashboardSettings } from "@/actions/dashboard-settings"
import { getMarketDigestSettings } from "@/actions/notifications"
import { DashboardSettingsForm } from "@/components/dashboard-settings-form"
import { NotificationSettingsForm } from "@/components/notification-settings-form"
import { auth } from "@/lib/auth"

export const metadata: Metadata = {
  title: "Settings",
  description:
    "Manage your Candlestick account settings and market digest delivery.",
}

export default async function SettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/sign-in?callbackURL=/settings")
  }

  const [marketDigestSettings, dashboardSettings] = await Promise.all([
    getMarketDigestSettings(),
    getDashboardSettings(),
  ])

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-full max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-normal text-foreground">
          Settings
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Manage your Candlestick account, alert delivery, and daily market
          digest preferences.
        </p>
        <NotificationSettingsForm {...marketDigestSettings} />
        <DashboardSettingsForm settings={dashboardSettings.dashboardSettings} />
      </div>
    </div>
  )
}

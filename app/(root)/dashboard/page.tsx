import type { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { getDashboardSettings } from "@/actions/dashboard-settings"
import { TvWidget } from "@/components/tv-widget"
import { auth } from "@/lib/auth"
import { getDashboardWidgets } from "@/lib/dashboard-widgets"

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Monitor market widgets, charts, technical analysis, and top market data in Candlestick.",
}

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/sign-in?callbackURL=/dashboard")
  }

  const { dashboardSettings } = await getDashboardSettings()
  const dashboardWidgets = getDashboardWidgets(dashboardSettings)

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
      {dashboardWidgets.map((widget) => (
        <TvWidget key={widget.title} {...widget} />
      ))}
    </div>
  )
}

import type { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { getMarketDigestSettings } from "@/actions/notifications"
import { SettingsForm } from "@/components/settings-form"
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

  const marketDigestSettings = await getMarketDigestSettings()

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-normal text-foreground">
          Settings
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Manage your Candlestick account, alert delivery, and daily market
          digest preferences.
        </p>
      <SettingsForm {...marketDigestSettings} />
      </div>
    </div>
  )
}

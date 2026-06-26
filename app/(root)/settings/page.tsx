import { getAlertEmailSetting } from "@/actions/alerts"
import { AlertEmailForm } from "@/components/alert-email-form"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export default async function SettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/sign-in?callbackURL=/settings")
  }

  const emailSetting = await getAlertEmailSetting()

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-semibold tracking-normal text-foreground">
        Settings
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        Manage your Candlestick account and market tracking preferences.
      </p>
      <AlertEmailForm {...emailSetting} />
    </div>
  )
}

import { TvWidget } from "@/components/tv-widget"
import { auth } from "@/lib/auth"
import { widgets } from "@/lib/constants"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/sign-in?callbackURL=/dashboard")
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
      {widgets.map((widget) => (
        <TvWidget key={widget.title} {...widget} />
      ))}
    </div>
  )
}

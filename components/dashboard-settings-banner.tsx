import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { user } from "@/lib/db/schema"

export async function DashboardSettingsBanner() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    return null
  }

  const [settings] = await db
    .select({
      dashboardSettingsSavedAt: user.dashboardSettingsSavedAt,
    })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1)

  if (settings?.dashboardSettingsSavedAt) {
    return null
  }

  return (
    <div className="border-b border-border bg-muted/40">
      <div className="mx-auto flex max-w-screen-2xl flex-col gap-3 px-4 py-3 text-sm text-foreground md:flex-row md:items-center md:justify-between md:px-6 lg:px-8">
        <p className="text-muted-foreground">
          Customize your dashboard to match the markets you follow.
        </p>
        <Button
          size="xs"
          variant="outline"
          render={<Link href="/settings#dashboard-settings" />}
          nativeButton={false}
        >
          Open settings
        </Button>
      </div>
    </div>
  )
}

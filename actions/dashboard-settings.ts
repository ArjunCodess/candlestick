"use server"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import {
  type DashboardSettings,
  getDefaultDashboardSettings,
  normalizeDashboardSettings,
} from "@/lib/dashboard-settings"
import { db } from "@/lib/db"
import { user } from "@/lib/db/schema"

async function getRequiredSession() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    redirect("/sign-in?callbackURL=/settings")
  }

  return session
}

export async function getDashboardSettings() {
  const session = await getRequiredSession()

  const [settings] = await db
    .select({
      dashboardSettings: user.dashboardSettings,
      dashboardSettingsSavedAt: user.dashboardSettingsSavedAt,
    })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1)

  return {
    dashboardSettings: normalizeDashboardSettings(
      settings?.dashboardSettings as Partial<DashboardSettings> | null
    ),
    dashboardSettingsSavedAt: settings?.dashboardSettingsSavedAt ?? null,
  }
}

export async function updateDashboardSettings(input: DashboardSettings) {
  const session = await getRequiredSession()
  const dashboardSettings = normalizeDashboardSettings(input)

  await db
    .update(user)
    .set({
      dashboardSettings,
      dashboardSettingsSavedAt: new Date(),
    })
    .where(eq(user.id, session.user.id))

  revalidatePath("/dashboard")
  revalidatePath("/settings")
}

export async function resetDashboardSettings() {
  const session = await getRequiredSession()
  const dashboardSettings = getDefaultDashboardSettings()

  await db
    .update(user)
    .set({
      dashboardSettings,
      dashboardSettingsSavedAt: new Date(),
    })
    .where(eq(user.id, session.user.id))

  revalidatePath("/dashboard")
  revalidatePath("/settings")

  return dashboardSettings
}

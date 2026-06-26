"use server"

import { randomUUID } from "node:crypto"

import { and, desc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

import {
  type AlertCondition,
  type AlertFrequency,
  isAlertCondition,
  isAlertFrequency,
} from "@/lib/alerts"
import { auth } from "@/lib/auth"
import { normalizeStockSymbol } from "@/lib/constants"
import { db } from "@/lib/db"
import { priceAlert, stock, user } from "@/lib/db/schema"

export type PriceAlertInput = {
  name: string
  stockSymbol: string
  condition: AlertCondition
  threshold: number
  frequency: AlertFrequency
}

async function getRequiredSession(callbackPath = "/alert") {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    redirect(`/sign-in?callbackURL=${encodeURIComponent(callbackPath)}`)
  }

  return session
}

function cleanAlertInput(input: PriceAlertInput) {
  const name = input.name.trim()
  const stockSymbol = normalizeStockSymbol(input.stockSymbol)
  const threshold = Number(input.threshold)

  if (!name) {
    throw new Error("Alert name is required.")
  }

  if (!stockSymbol) {
    throw new Error("Stock symbol is required.")
  }

  if (!isAlertCondition(input.condition)) {
    throw new Error("Alert condition is invalid.")
  }

  if (!Number.isFinite(threshold) || threshold <= 0) {
    throw new Error("Threshold must be greater than zero.")
  }

  if (!isAlertFrequency(input.frequency)) {
    throw new Error("Alert frequency is invalid.")
  }

  return {
    name,
    stockSymbol,
    condition: input.condition,
    threshold,
    frequency: input.frequency,
  }
}

export async function getPriceAlerts() {
  const session = await getRequiredSession()

  return db
    .select({
      id: priceAlert.id,
      name: priceAlert.name,
      stockSymbol: priceAlert.stockSymbol,
      condition: priceAlert.condition,
      threshold: priceAlert.threshold,
      frequency: priceAlert.frequency,
      isActive: priceAlert.isActive,
      lastTriggeredAt: priceAlert.lastTriggeredAt,
      createdAt: priceAlert.createdAt,
    })
    .from(priceAlert)
    .where(eq(priceAlert.userId, session.user.id))
    .orderBy(desc(priceAlert.createdAt))
}

export async function createPriceAlert(input: PriceAlertInput) {
  const session = await getRequiredSession()
  const values = cleanAlertInput(input)

  await db
    .insert(stock)
    .values({ symbol: values.stockSymbol })
    .onConflictDoNothing()
  await db.insert(priceAlert).values({
    id: randomUUID(),
    userId: session.user.id,
    ...values,
  })

  revalidatePath("/alert")
}

export async function updatePriceAlert(id: string, input: PriceAlertInput) {
  const session = await getRequiredSession()
  const values = cleanAlertInput(input)

  await db
    .insert(stock)
    .values({ symbol: values.stockSymbol })
    .onConflictDoNothing()
  await db
    .update(priceAlert)
    .set(values)
    .where(and(eq(priceAlert.id, id), eq(priceAlert.userId, session.user.id)))

  revalidatePath("/alert")
}

export async function deletePriceAlert(id: string) {
  const session = await getRequiredSession()

  await db
    .delete(priceAlert)
    .where(and(eq(priceAlert.id, id), eq(priceAlert.userId, session.user.id)))

  revalidatePath("/alert")
}

export async function getAlertEmailSetting() {
  const session = await getRequiredSession("/settings")

  const [settings] = await db
    .select({ email: user.email, alertEmail: user.alertEmail })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1)

  return {
    accountEmail: settings?.email ?? session.user.email,
    alertEmail: settings?.alertEmail ?? settings?.email ?? session.user.email,
  }
}

export async function updateAlertEmailSetting(alertEmail: string) {
  const session = await getRequiredSession("/settings")
  const cleanedEmail = alertEmail.trim()

  if (!cleanedEmail || !cleanedEmail.includes("@")) {
    throw new Error("Enter a valid email address.")
  }

  await db
    .update(user)
    .set({ alertEmail: cleanedEmail })
    .where(eq(user.id, session.user.id))

  revalidatePath("/settings")
}

import nodemailer from "nodemailer"

import type { NewsHeadline } from "@/lib/news"

type AlertEmail = {
  to: string
  subject: string
  text: string
}

function getTransport() {
  const host = process.env.SMTP_HOST ?? "smtp.gmail.com"
  const port = Number(process.env.SMTP_PORT)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!pass) {
    throw new Error("SMTP_PASS is not configured.")
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  })
}

export async function sendAlertEmail({ to, subject, text }: AlertEmail) {
  const from =
    process.env.SMTP_FROM ??
    "Candlestick Alerts <arjunv.prakash12345@gmail.com>"

  await getTransport().sendMail({
    from,
    to,
    subject,
    text,
  })
}

export async function sendMarketDigestEmail({
  headlines,
  to,
}: {
  headlines: NewsHeadline[]
  to: string
}) {
  const text = [
    "Your Candlestick market digest is ready.",
    "",
    "Business headlines:",
    ...headlines.map(
      (headline, index) =>
        `${index + 1}. ${headline.title}\n${headline.sourceName} - ${headline.url}`
    ),
    "",
  ].join("\n")

  await sendAlertEmail({
    to,
    subject: "Candlestick Daily Market Digest",
    text,
  })
}

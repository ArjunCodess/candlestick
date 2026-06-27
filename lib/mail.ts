import nodemailer from "nodemailer"

import type { NewsHeadline } from "@/lib/news"

type AlertEmail = {
  to: string
  subject: string
  text: string
}

export type StockReview = {
  change: number | null
  percentChange: number | null
  price: number | null
  review: string
  symbol: string
  url: string
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
  stockReviews,
  to,
}: {
  headlines: NewsHeadline[]
  stockReviews: StockReview[]
  to: string
}) {
  const stockLines = stockReviews.length
    ? stockReviews.map((stock) => {
        if (stock.price === null) {
          return `${stock.symbol}: unavailable\n${stock.url}`
        }

        const sign = stock.percentChange && stock.percentChange > 0 ? "+" : ""

        return [
          `${stock.symbol}: ${stock.review}`,
          `Price: ${stock.price.toFixed(2)} | Move: ${sign}${stock.percentChange?.toFixed(2)}% (${stock.change?.toFixed(2)})`,
          stock.url,
        ].join("\n")
      })
    : ["No watchlist stocks yet."]

  const text = [
    "Your Candlestick market digest is ready.",
    "",
    "Business headlines:",
    ...headlines.map(
      (headline, index) =>
        `${index + 1}. ${headline.title}\n${headline.sourceName} - ${headline.url}`
    ),
    "",
    "Watchlist stock reviews:",
    ...stockLines,
    "",
    "Sent by Candlestick.",
  ].join("\n")

  await sendAlertEmail({
    to,
    subject: "Candlestick Daily Market Digest",
    text,
  })
}

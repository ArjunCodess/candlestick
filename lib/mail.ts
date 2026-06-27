import nodemailer from "nodemailer"

import type { NewsHeadline } from "@/lib/news"

type AlertEmail = {
  html?: string
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

type QuotedStockReview = StockReview & {
  change: number
  percentChange: number
  price: number
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

function formatSignedPercent(value: number) {
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`
}

function formatSignedChange(value: number) {
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}`
}

function formatMoverLine(stock: QuotedStockReview) {
  return `${stock.symbol}: ${formatSignedPercent(stock.percentChange)} (${formatSignedChange(stock.change)}) at ${stock.price.toFixed(2)}`
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}

export async function sendAlertEmail({ html, to, subject, text }: AlertEmail) {
  const from =
    process.env.SMTP_FROM ??
    "Candlestick Alerts <arjunv.prakash12345@gmail.com>"

  await getTransport().sendMail({
    from,
    to,
    subject,
    text,
    html,
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
  const quotedStocks = stockReviews.filter(
    (stock): stock is QuotedStockReview =>
      stock.change !== null &&
      stock.percentChange !== null &&
      stock.price !== null
  )

  const sortedByMove = [...quotedStocks].sort(
    (first, second) => second.percentChange - first.percentChange
  )

  const biggestGainer = sortedByMove.find((stock) => stock.percentChange > 0)

  const biggestLoser = [...sortedByMove]
    .reverse()
    .find((stock) => stock.percentChange < 0)

  const topMovers = [...quotedStocks]
    .sort(
      (first, second) =>
        Math.abs(second.percentChange) - Math.abs(first.percentChange)
    )
    .slice(0, 3)

  const upCount = quotedStocks.filter((stock) => stock.percentChange > 0).length

  const downCount = quotedStocks.filter(
    (stock) => stock.percentChange < 0
  ).length

  const flatCount = quotedStocks.length - upCount - downCount

  const watchlistSummary = stockReviews.length
    ? quotedStocks.length
      ? `Summary: ${upCount} up, ${downCount} down, ${flatCount} flat.`
      : "Summary: Watchlist quotes unavailable."
    : "Summary: No watchlist stocks yet."

  const watchlistMoverLines = [
    `Biggest gainer: ${biggestGainer ? formatMoverLine(biggestGainer) : "n/a"}`,
    `Biggest loser: ${biggestLoser ? formatMoverLine(biggestLoser) : "n/a"}`,
    "",
    "Top movers from your watchlist:",
    ...(topMovers.length
      ? topMovers.map(
          (stock, index) => `${index + 1}. ${formatMoverLine(stock)}`
        )
      : ["No quoted watchlist movers available."]),
  ]
  const stockLines = stockReviews.length
    ? stockReviews.map((stock) => {
        if (stock.price === null) {
          return `${stock.symbol}: unavailable\n${stock.url}`
        }

        const percentChange =
          stock.percentChange === null
            ? "unavailable"
            : formatSignedPercent(stock.percentChange)
        const change =
          stock.change === null
            ? "unavailable"
            : formatSignedChange(stock.change)

        return [
          `${stock.symbol}: ${stock.review}`,
          `Price: ${stock.price.toFixed(2)} | Move: ${percentChange} (${change})`,
          stock.url,
        ].join("\n")
      })
    : ["No watchlist stocks yet."]

  const text = [
    watchlistSummary,
    "",
    "Watchlist movers:",
    ...watchlistMoverLines,
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

  const html = `
    <div style="font-family: Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #111827; line-height: 1.55; max-width: 750px;">
      <h1 style="font-size: 24px; margin: 0 0 8px;">Daily Market Digest</h1>
      <p style="margin: 0 0 24px;"><em>${escapeHtml(watchlistSummary)}</em></p>

      <h2 style="font-size: 18px; margin: 0 0 12px;">Watchlist movers</h2>
      <p style="margin: 0 0 8px;"><strong>${escapeHtml(watchlistMoverLines[0] ?? "")}</strong></p>
      <p style="margin: 0 0 16px;"><strong>${escapeHtml(watchlistMoverLines[1] ?? "")}</strong></p>
      <p style="margin: 0 0 8px;"><em>Top movers from your watchlist:</em></p>
      <ol style="margin: 0 0 24px; padding-left: 22px;">
        ${
          topMovers.length
            ? topMovers
                .map(
                  (stock) =>
                    `<li><strong>${escapeHtml(stock.symbol)}</strong>: ${escapeHtml(formatSignedPercent(stock.percentChange))} (${escapeHtml(formatSignedChange(stock.change))}) at ${escapeHtml(stock.price.toFixed(2))}</li>`
                )
                .join("")
            : `<li>${escapeHtml("No quoted watchlist movers available.")}</li>`
        }
      </ol>

      <h2 style="font-size: 18px; margin: 0 0 12px;">Business headlines</h2>
      <ol style="margin: 0 0 24px; padding-left: 22px;">
        ${headlines
          .map(
            (headline) =>
              `<li style="margin-bottom: 12px;"><strong>${escapeHtml(headline.title)}</strong><br><em>${escapeHtml(headline.sourceName)}</em> - <a href="${escapeHtml(headline.url)}">${escapeHtml(headline.url)}</a></li>`
          )
          .join("")}
      </ol>

      <h2 style="font-size: 18px; margin: 0 0 12px;">Watchlist stock reviews</h2>
      <div style="margin: 0 0 24px;">
        ${
          stockReviews.length
            ? stockReviews
                .map((stock) => {
                  if (stock.price === null) {
                    return `<p><strong>${escapeHtml(stock.symbol)}</strong>: unavailable<br><a href="${escapeHtml(stock.url)}">${escapeHtml(stock.url)}</a></p>`
                  }

                  const percentChange =
                    stock.percentChange === null
                      ? "unavailable"
                      : formatSignedPercent(stock.percentChange)
                  const change =
                    stock.change === null
                      ? "unavailable"
                      : formatSignedChange(stock.change)

                  return `<p><strong>${escapeHtml(stock.symbol)}</strong>: <em>${escapeHtml(stock.review)}</em><br>Price: <strong>${escapeHtml(stock.price.toFixed(2))}</strong> | Move: <strong>${escapeHtml(percentChange)}</strong> (${escapeHtml(change)})<br><a href="${escapeHtml(stock.url)}">${escapeHtml(stock.url)}</a></p>`
                })
                .join("")
            : `<p><em>${escapeHtml("No watchlist stocks yet.")}</em></p>`
        }
      </div>

      <p style="margin: 0;"><em>Sent by Candlestick.</em></p>
    </div>
  `

  await sendAlertEmail({
    html,
    to,
    subject: "Candlestick: Daily Market Digest",
    text,
  })
}

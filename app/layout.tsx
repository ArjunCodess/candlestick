import type { Metadata, Viewport } from "next"
import { Geist_Mono, Inter } from "next/font/google"

import "./globals.css"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const appUrl = process.env.BETTER_AUTH_URL!

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0a",
}

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Candlestick",
    template: "%s | Candlestick",
  },
  description:
    "Track stocks, build watchlists, and receive price alerts from a focused market dashboard.",
  applicationName: "Candlestick",
  openGraph: {
    type: "website",
    siteName: "Candlestick",
    title: "Candlestick",
    description:
      "Track stocks, build watchlists, and receive price alerts from a focused market dashboard.",
  },
  twitter: {
    card: "summary",
    title: "Candlestick",
    description:
      "Track stocks, build watchlists, and receive price alerts from a focused market dashboard.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "dark antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable
      )}
    >
      <body>{children}</body>
    </html>
  )
}

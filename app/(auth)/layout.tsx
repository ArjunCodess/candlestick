import { HugeiconsIcon } from "@hugeicons/react"
import { ChartCandlestickIcon } from "@hugeicons/core-free-icons"
import Link from "next/link"

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <main className="grid min-h-screen lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,1fr)]">
      <section className="hidden border-r border-border bg-muted/30 p-10 lg:flex lg:flex-col lg:justify-between">
        <Link
          href="/"
          className="text-primary flex items-center gap-2 text-sm font-semibold tracking-widest uppercase"
        >
          <HugeiconsIcon icon={ChartCandlestickIcon} strokeWidth={1.5} />
          <span>Candlestick</span>
        </Link>
        <div className="max-w-md">
          <p className="text-sm font-semibold tracking-widest text-primary uppercase">
            Stock market workspace
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-normal text-foreground">
            Follow candlestick setups, active tickers, and market movement in one focused dashboard.
          </h1>
        </div>
      </section>
      <section className="flex min-h-screen items-center justify-center px-4 py-10">
        {children}
      </section>
    </main>
  )
}

"use client"

import { cn } from "@/lib/utils"
import { useScroll } from "@/hooks/use-scroll"
import { Button } from "@/components/ui/button"
import { MobileNav } from "@/components/mobile-nav"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ChartCandlestickIcon } from "@hugeicons/core-free-icons"

export const navLinks = [
  {
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    label: "Search",
    href: "/search",
  },
  {
    label: "Waitlist",
    href: "/waitlist",
  },
]

function Logo() {
  return (
    <Link
      href="/"
      className="text-primary flex items-center gap-2 text-sm font-semibold tracking-widest uppercase"
    >
      <HugeiconsIcon icon={ChartCandlestickIcon} strokeWidth={1.5} />
      <span>Candlestick</span>
    </Link>
  )
}

export function Header() {
  const scrolled = useScroll(10)

  return (
    <header
      className={cn("sticky top-0 z-50 w-full border-b border-transparent", {
        "border-border bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/50":
          scrolled,
      })}
    >
      <nav className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
        <Logo />
        <div className="hidden items-center gap-2 md:flex">
          {navLinks.map((link) => (
            <Button
              key={link.label}
              size="sm"
              variant="ghost"
              render={<a href={link.href} />}
              nativeButton={false}
            >
              {link.label}
            </Button>
          ))}
        </div>
        <MobileNav />
      </nav>
    </header>
  )
}

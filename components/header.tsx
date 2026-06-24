"use client"

import { cn } from "@/lib/utils"
import { useScroll } from "@/hooks/use-scroll"
import { Button } from "@/components/ui/button"
import { MobileNav } from "@/components/mobile-nav"
import { StockSearch } from "@/components/stock-search"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ChartCandlestickIcon,
  Logout03Icon,
  Settings01Icon,
} from "@hugeicons/core-free-icons"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { authClient } from "@/lib/auth-client"

export const navLinks = [
  {
    label: "Dashboard",
    href: "/dashboard",
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
      <nav className="mx-auto grid h-14 w-full max-w-5xl grid-cols-[1fr_auto_1fr] items-center px-4">
        <Logo />
        <div className="hidden items-center gap-2 justify-self-center md:flex">
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
          <StockSearch />
        </div>
        <div className="flex items-center gap-2 justify-self-end">
          <MobileNav />
          <UserMenu />
        </div>
      </nav>
    </header>
  )
}

function UserMenu() {
  const router = useRouter()
  const { data: session } = authClient.useSession()
  const user = session?.user
  const fallback = getInitials(user?.name ?? user?.email)

  async function onLogout() {
    await authClient.signOut()
    router.push("/sign-in")
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            aria-label="Open account menu"
            className="rounded-full border-border p-0"
            size="icon"
            variant="ghost"
          />
        }
      >
        <Avatar size="sm">
          {user?.image && <AvatarImage src={user.image} alt={user.name ?? ""} />}
          <AvatarFallback>{fallback}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8}>
        <DropdownMenuGroup>
          <DropdownMenuItem render={<Link href="/settings" />}>
            <HugeiconsIcon icon={Settings01Icon} strokeWidth={2} />
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={onLogout} variant="destructive">
            <HugeiconsIcon icon={Logout03Icon} strokeWidth={2} />
            Logout
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function getInitials(value?: string | null) {
  if (!value) {
    return "CS"
  }

  const parts = value
    .replace(/@.*/, "")
    .split(/\s+/)
    .filter(Boolean)

  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

"use client"

import { useOptimistic, useTransition } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  BookmarkAdd01Icon,
  BookmarkCheck01Icon,
} from "@hugeicons/core-free-icons"
import { toggleWatchlist } from "@/actions/watchlist"
import { Button } from "@/components/ui/button"

type WatchlistButtonProps = {
  isWatchlisted: boolean
  symbol: string
}

export default function WatchlistButton({
  isWatchlisted,
  symbol,
}: WatchlistButtonProps) {
  const [saved, setSaved] = useOptimistic(isWatchlisted)
  const [pending, startTransition] = useTransition()
  const Icon = saved ? BookmarkCheck01Icon : BookmarkAdd01Icon

  function onClick() {
    const nextSaved = !saved

    startTransition(async () => {
      setSaved(nextSaved)
      await toggleWatchlist(
        symbol,
        nextSaved,
        `/stock/${encodeURIComponent(symbol)}`
      )
    })
  }

  return (
    <Button
      className="w-full"
      disabled={pending}
      onClick={onClick}
      size="lg"
      variant={saved ? "outline" : "default"}
    >
      <HugeiconsIcon icon={Icon} strokeWidth={1.8} />
      {saved ? "In watchlist" : "Add to watchlist"}
    </Button>
  )
}

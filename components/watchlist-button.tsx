"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { BookmarkAdd01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"

export default function WatchlistButton() {
  return (
    <Button className="w-full" size="lg" variant="default">
      <HugeiconsIcon icon={BookmarkAdd01Icon} strokeWidth={1.8} />
      Add to watchlist
    </Button>
  )
}

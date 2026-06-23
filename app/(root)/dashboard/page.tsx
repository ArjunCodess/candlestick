import { TvWidget } from "@/components/tv-widget"
import { widgets } from "@/lib/constants"

export default function DashboardPage() {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
      {widgets.map((widget) => (
        <TvWidget key={widget.title} {...widget} />
      ))}
    </div>
  )
}

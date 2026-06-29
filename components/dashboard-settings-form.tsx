"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import {
  resetDashboardSettings,
  updateDashboardSettings,
} from "@/actions/dashboard-settings"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import type {
  DashboardSettings,
  DashboardWidgetId,
  MarketDataGroup,
  MarketOverviewDateRange,
  MarketOverviewTab,
  StockHeatmapGrouping,
} from "@/lib/dashboard-settings"

const widgetLabels: Array<{ id: DashboardWidgetId; label: string }> = [
  { id: "marketOverview", label: "Market Overview" },
  { id: "stockHeatmap", label: "Stock Heatmap" },
  { id: "topStories", label: "Top Stories" },
  { id: "marketData", label: "Market Data" },
]

const dateRangeOptions: Array<{
  value: MarketOverviewDateRange
  label: string
}> = [
  { value: "1D", label: "1 day" },
  { value: "1M", label: "1 month" },
  { value: "3M", label: "3 months" },
  { value: "12M", label: "1 year" },
  { value: "60M", label: "5 years" },
  { value: "ALL", label: "All" },
]

const heatmapSources = [
  { value: "SPX500", label: "S&P 500" },
  { value: "NASDAQ100", label: "Nasdaq 100" },
  { value: "DJDJI", label: "Dow Jones" },
  { value: "SENSEX", label: "Sensex" },
]

const heatmapGroupings: Array<{ value: StockHeatmapGrouping; label: string }> =
  [
    { value: "sector", label: "Sector" },
    { value: "no_group", label: "No group" },
  ]

type DashboardSettingsFormProps = {
  settings: DashboardSettings
}

export function DashboardSettingsForm({
  settings,
}: DashboardSettingsFormProps) {
  const router = useRouter()
  const [form, setForm] = React.useState(settings)
  const [saving, setSaving] = React.useState(false)
  const [resetting, setResetting] = React.useState(false)
  const [saved, setSaved] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaved(false)
    setError(null)
    setSaving(true)

    try {
      await updateDashboardSettings(form)
      setSaved(true)
      router.refresh()
    } catch {
      setError("Unable to save dashboard settings.")
    } finally {
      setSaving(false)
    }
  }

  async function onReset() {
    setSaving(false)
    setResetting(true)
    setSaved(false)
    setError(null)

    try {
      const defaults = await resetDashboardSettings()
      setForm(defaults)
      setSaved(true)
      router.refresh()
    } catch {
      setError("Unable to reset dashboard settings.")
    } finally {
      setResetting(false)
    }
  }

  function updateWidget(widgetId: DashboardWidgetId, enabled: boolean) {
    setForm((current) => ({
      ...current,
      enabledWidgets: {
        ...current.enabledWidgets,
        [widgetId]: enabled,
      },
    }))
  }

  return (
    <Card id="dashboard-settings" className="mt-8 scroll-mt-24">
      <CardHeader>
        <CardTitle>Dashboard settings</CardTitle>
        <CardDescription>
          Choose the widgets and markets that appear on your dashboard.
        </CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent>
          <FieldGroup>
            <FieldSet>
              <FieldLegend>Visible widgets</FieldLegend>
              <div className="grid gap-3 sm:grid-cols-2">
                {widgetLabels.map((widget) => (
                  <Field
                    className="border border-border p-4"
                    key={widget.id}
                    orientation="horizontal"
                  >
                    <Checkbox
                      checked={form.enabledWidgets[widget.id]}
                      onCheckedChange={(checked) =>
                        updateWidget(widget.id, checked === true)
                      }
                    />
                    {widget.label}
                  </Field>
                ))}
              </div>
            </FieldSet>

            <SettingsSection
              description="Set the default chart range and the watchlist tabs."
              title="Market Overview"
            >
              <Field>
                <FieldLabel>Default date range</FieldLabel>
                <Select
                  onValueChange={(dateRange) => {
                    if (!dateRange) {
                      return
                    }

                    setForm((current) => ({
                      ...current,
                      marketOverview: {
                        ...current.marketOverview,
                        dateRange: dateRange as MarketOverviewDateRange,
                      },
                    }))
                  }}
                  value={form.marketOverview.dateRange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align="start">
                    <SelectGroup>
                      {dateRangeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <TabsEditor
                tabs={form.marketOverview.tabs}
                onChange={(tabs) =>
                  setForm((current) => ({
                    ...current,
                    marketOverview: { ...current.marketOverview, tabs },
                  }))
                }
              />
            </SettingsSection>

            <SettingsSection
              description="Choose the market and grouping shown in the heatmap."
              title="Stock Heatmap"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Field>
                  <FieldLabel>Data source</FieldLabel>
                  <Select
                    onValueChange={(dataSource) => {
                      if (!dataSource) {
                        return
                      }

                      setForm((current) => ({
                        ...current,
                        stockHeatmap: {
                          ...current.stockHeatmap,
                          dataSource,
                        },
                      }))
                    }}
                    value={form.stockHeatmap.dataSource}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent align="start">
                      <SelectGroup>
                        {heatmapSources.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel>Grouping</FieldLabel>
                  <Select
                    onValueChange={(grouping) => {
                      if (!grouping) {
                        return
                      }

                      setForm((current) => ({
                        ...current,
                        stockHeatmap: {
                          ...current.stockHeatmap,
                          grouping: grouping as StockHeatmapGrouping,
                        },
                      }))
                    }}
                    value={form.stockHeatmap.grouping}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent align="start">
                      <SelectGroup>
                        {heatmapGroupings.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </SettingsSection>

            <SettingsSection
              description="Edit the quote groups shown in the Market Data widget."
              title="Market Data"
            >
              <MarketDataEditor
                groups={form.marketData.symbolsGroups}
                onChange={(symbolsGroups) =>
                  setForm((current) => ({
                    ...current,
                    marketData: { symbolsGroups },
                  }))
                }
              />
            </SettingsSection>

            {error && <FieldError>{error}</FieldError>}
          </FieldGroup>
        </CardContent>
        <CardFooter className="mt-6 flex-col items-stretch justify-between gap-3 border-t sm:flex-row sm:items-center">
          <p className="text-sm text-muted-foreground">
            {saved ? "Dashboard settings saved." : "Changes apply after save."}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              disabled={saving || resetting}
              onClick={onReset}
              type="button"
              variant="outline"
            >
              {resetting ? "Resetting settings" : "Reset to defaults"}
            </Button>
            <Button disabled={saving || resetting} type="submit">
              {saving ? "Saving settings" : "Save dashboard settings"}
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}

function SettingsSection({
  children,
  description,
  title,
}: {
  children: React.ReactNode
  description: string
  title: string
}) {
  return (
    <section className="flex flex-col gap-5">
      <Separator />
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold tracking-wider text-foreground uppercase">
          {title}
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      {children}
    </section>
  )
}

function TabsEditor({
  tabs,
  onChange,
}: {
  tabs: MarketOverviewTab[]
  onChange: (tabs: MarketOverviewTab[]) => void
}) {
  return (
    <Field>
      <FieldLabel>Tabs</FieldLabel>
      <FieldDescription>
        Use TradingView symbols like NASDAQ:AAPL or BINANCE:BTCUSDT.
      </FieldDescription>
      <div className="grid gap-4 xl:grid-cols-2">
        {tabs.map((tab, tabIndex) => (
          <EditableGroup
            canRemove={tabs.length > 1}
            countLabel={`${tab.symbols.length} symbols`}
            key={tabIndex}
            name={tab.title}
            nameLabel="Tab name"
            onNameChange={(title) => {
              const nextTabs = [...tabs]
              nextTabs[tabIndex] = { ...tab, title }
              onChange(nextTabs)
            }}
            onRemove={() => onChange(tabs.filter((_, i) => i !== tabIndex))}
          >
            <SymbolRows
              addLabel="Add symbol"
              displayKey="d"
              itemName="symbol"
              newSymbol={{ s: "", d: "" }}
              onChange={(symbols) => {
                const nextTabs = [...tabs]
                nextTabs[tabIndex] = { ...tab, symbols }
                onChange(nextTabs)
              }}
              symbolKey="s"
              symbols={tab.symbols}
            />
          </EditableGroup>
        ))}
      </div>
      <div className="flex">
        <Button
          className="w-full"
          onClick={() =>
            onChange([
              ...tabs,
              { title: "New tab", symbols: [{ s: "", d: "" }] },
            ])
          }
          type="button"
        >
          Add tab
        </Button>
      </div>
    </Field>
  )
}

function MarketDataEditor({
  groups,
  onChange,
}: {
  groups: MarketDataGroup[]
  onChange: (groups: MarketDataGroup[]) => void
}) {
  return (
    <Field>
      <FieldLabel>Groups</FieldLabel>
      <FieldDescription>
        Use TradingView symbols like FOREXCOM:SPXUSD or COMEX:GC1!.
      </FieldDescription>
      <div className="grid gap-4 xl:grid-cols-2">
        {groups.map((group, groupIndex) => (
          <EditableGroup
            canRemove={groups.length > 1}
            countLabel={`${group.symbols.length} symbols`}
            key={groupIndex}
            name={group.name}
            nameLabel="Group name"
            onNameChange={(name) => {
              const nextGroups = [...groups]
              nextGroups[groupIndex] = { ...group, name }
              onChange(nextGroups)
            }}
            onRemove={() => onChange(groups.filter((_, i) => i !== groupIndex))}
          >
            <SymbolRows
              addLabel="Add symbol"
              displayKey="displayName"
              itemName="symbol"
              newSymbol={{ name: "", displayName: "" }}
              onChange={(symbols) => {
                const nextGroups = [...groups]
                nextGroups[groupIndex] = { ...group, symbols }
                onChange(nextGroups)
              }}
              symbolKey="name"
              symbols={group.symbols}
            />
          </EditableGroup>
        ))}
      </div>
      <div className="flex">
        <Button
          className="w-full"
          onClick={() =>
            onChange([
              ...groups,
              { name: "New group", symbols: [{ name: "", displayName: "" }] },
            ])
          }
          type="button"
        >
          Add group
        </Button>
      </div>
    </Field>
  )
}

function EditableGroup({
  canRemove,
  children,
  countLabel,
  name,
  nameLabel,
  onNameChange,
  onRemove,
}: {
  canRemove: boolean
  children: React.ReactNode
  countLabel: string
  name: string
  nameLabel: string
  onNameChange: (name: string) => void
  onRemove: () => void
}) {
  return (
    <div className="flex flex-col gap-4 border border-border p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <Field className="flex-1">
          <FieldLabel>{nameLabel}</FieldLabel>
          <Input
            onChange={(event) => onNameChange(event.target.value)}
            value={name}
          />
        </Field>
        <div className="flex items-center gap-3 sm:pb-2">
          <Badge variant="secondary">{countLabel}</Badge>
          <Button
            disabled={!canRemove}
            onClick={onRemove}
            size="xs"
            type="button"
            variant="outline"
          >
            Remove
          </Button>
        </div>
      </div>
      {children}
    </div>
  )
}

function SymbolRows<T extends Record<string, string>>({
  addLabel,
  displayKey,
  itemName,
  newSymbol,
  onChange,
  symbolKey,
  symbols,
}: {
  addLabel: string
  displayKey: keyof T
  itemName: string
  newSymbol: T
  onChange: (symbols: T[]) => void
  symbolKey: keyof T
  symbols: T[]
}) {
  return (
    <div className="flex flex-col gap-3">
      {symbols.map((symbol, symbolIndex) => (
        <div
          className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
          key={symbolIndex}
        >
          <Field>
            <FieldLabel>Symbol</FieldLabel>
            <Input
              onChange={(event) => {
                const nextSymbols = [...symbols]
                nextSymbols[symbolIndex] = {
                  ...symbol,
                  [symbolKey]: event.target.value,
                }
                onChange(nextSymbols)
              }}
              placeholder="NASDAQ:AAPL"
              value={symbol[symbolKey]}
            />
          </Field>
          <Field>
            <FieldLabel>Display name</FieldLabel>
            <Input
              onChange={(event) => {
                const nextSymbols = [...symbols]
                nextSymbols[symbolIndex] = {
                  ...symbol,
                  [displayKey]: event.target.value,
                }
                onChange(nextSymbols)
              }}
              placeholder="Apple"
              value={symbol[displayKey]}
            />
          </Field>
          <div className="flex items-end">
            <Button
              disabled={symbols.length <= 1}
              onClick={() =>
                onChange(symbols.filter((_, i) => i !== symbolIndex))
              }
              size="xs"
              type="button"
              variant="outline"
            >
              Remove
            </Button>
          </div>
        </div>
      ))}
      <Button onClick={() => onChange([...symbols, newSymbol])} type="button">
        {addLabel}
      </Button>
      <FieldDescription>
        Keep at least one {itemName} in each list.
      </FieldDescription>
    </div>
  )
}

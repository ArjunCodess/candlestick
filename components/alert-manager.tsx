"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  Alert01Icon,
  Delete01Icon,
  PencilEdit02Icon,
} from "@hugeicons/core-free-icons"

import {
  createPriceAlert,
  deletePriceAlert,
  updatePriceAlert,
  type PriceAlertInput,
} from "@/actions/notifications"
import {
  alertConditionLabels,
  alertConditions,
  alertFrequencies,
  alertFrequencyLabels,
  formatAlertCondition,
  formatPrice,
  type AlertCondition,
  type AlertFrequency,
} from "@/lib/alerts"
import type { StockProfile, StockQuote } from "@/lib/stocks"
import { getDisplayStockSymbol } from "@/lib/stock-symbols"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type AlertCardItem = {
  id: string
  name: string
  stockSymbol: string
  condition: AlertCondition
  threshold: number
  frequency: AlertFrequency
  profile: StockProfile
  quote: StockQuote | null
}

type AlertManagerProps = {
  alerts: AlertCardItem[]
}

type FormState = PriceAlertInput & {
  id?: string
}

type StockResult = {
  exchange: string
  name: string
  percentChange: number | null
  price: number | null
  providerSymbol: string
  ticker: string
  type: string
}

const emptyForm: FormState = {
  name: "",
  stockSymbol: "",
  condition: "greater_than",
  threshold: 0,
  frequency: "1d",
}

const conditionItems = alertConditions.map((condition) => ({
  label: alertConditionLabels[condition],
  value: condition,
}))

const frequencyItems = alertFrequencies.map((frequency) => ({
  label: alertFrequencyLabels[frequency],
  value: frequency,
}))

export function AlertManager({ alerts }: AlertManagerProps) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [form, setForm] = React.useState<FormState>(emptyForm)
  const [stockQuery, setStockQuery] = React.useState("")
  const [stockResults, setStockResults] = React.useState<StockResult[]>([])
  const [selectedStock, setSelectedStock] = React.useState<StockResult | null>(
    null
  )
  const [searchingStocks, setSearchingStocks] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [stockSearchError, setStockSearchError] = React.useState<string | null>(
    null
  )
  const [saving, setSaving] = React.useState(false)
  const searchTimeoutRef = React.useRef<number | null>(null)
  const searchControllerRef = React.useRef<AbortController | null>(null)

  function openCreateDialog() {
    setForm(emptyForm)
    resetStockSearch()
    setError(null)
    setOpen(true)
  }

  function openEditDialog(alert: AlertCardItem) {
    setForm({
      id: alert.id,
      name: alert.name,
      stockSymbol: alert.stockSymbol,
      condition: alert.condition,
      threshold: alert.threshold,
      frequency: alert.frequency,
    })
    setSelectedStock({
      exchange: "",
      name: alert.profile.name,
      percentChange: alert.quote?.percentChange ?? null,
      price: alert.quote?.price ?? null,
      providerSymbol: alert.stockSymbol,
      ticker: getDisplayStockSymbol(alert.stockSymbol),
      type: "",
    })
    setStockQuery(
      `${getDisplayStockSymbol(alert.stockSymbol)} - ${alert.profile.name}`
    )
    setStockResults([])
    setStockSearchError(null)
    setError(null)
    setOpen(true)
  }

  function resetStockSearch() {
    searchControllerRef.current?.abort()

    if (searchTimeoutRef.current) {
      window.clearTimeout(searchTimeoutRef.current)
    }

    setStockQuery("")
    setStockResults([])
    setSelectedStock(null)
    setSearchingStocks(false)
    setStockSearchError(null)
  }

  function updateStockQuery(value: string) {
    const nextQuery = value.trim()

    setStockQuery(value)
    setSelectedStock(null)
    setForm((current) => ({ ...current, stockSymbol: "" }))
    searchControllerRef.current?.abort()

    if (searchTimeoutRef.current) {
      window.clearTimeout(searchTimeoutRef.current)
    }

    if (nextQuery.length < 2) {
      setStockResults([])
      setSearchingStocks(false)
      setStockSearchError(null)
      return
    }

    searchTimeoutRef.current = window.setTimeout(() => {
      void searchStocks(nextQuery)
    }, 350)
  }

  async function searchStocks(query: string) {
    const controller = new AbortController()
    searchControllerRef.current = controller
    setSearchingStocks(true)
    setStockSearchError(null)
    setStockResults([])

    try {
      const response = await fetch(
        `/api/stocks/search?q=${encodeURIComponent(query)}`,
        { signal: controller.signal }
      )
      const data = (await response.json()) as {
        error?: string
        results?: StockResult[]
      }

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to search stocks.")
      }

      setStockResults(data.results ?? [])
    } catch (searchError) {
      if (
        searchError instanceof DOMException &&
        searchError.name === "AbortError"
      ) {
        return
      }

      setStockSearchError("Stock search is unavailable right now.")
      setStockResults([])
    } finally {
      if (!controller.signal.aborted) {
        setSearchingStocks(false)
      }
    }
  }

  function selectStock(stock: StockResult) {
    setSelectedStock(stock)
    setStockQuery(`${stock.ticker} - ${stock.name}`)
    setStockResults([])
    setStockSearchError(null)
    setForm((current) => ({
      ...current,
      stockSymbol: stock.providerSymbol,
    }))
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError(null)

    try {
      if (!selectedStock || selectedStock.providerSymbol !== form.stockSymbol) {
        throw new Error("Select a stock from the search results.")
      }

      if (selectedStock.price === null) {
        throw new Error("Finnhub does not have a usable quote for this stock.")
      }

      if (form.id) {
        await updatePriceAlert(form.id, form)
      } else {
        await createPriceAlert(form)
      }

      setOpen(false)
      router.refresh()
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to save alert."
      )
    } finally {
      setSaving(false)
    }
  }

  async function onDelete(id: string) {
    await deletePriceAlert(id)
    router.refresh()
  }

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Alerts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {alerts.length} active {alerts.length === 1 ? "alert" : "alerts"}
          </p>
        </div>
        <Button className="w-full sm:w-auto" onClick={openCreateDialog}>
          <HugeiconsIcon
            icon={Add01Icon}
            strokeWidth={2}
            data-icon="inline-start"
          />
          Create alert
        </Button>
      </div>

      {alerts.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {alerts.map((alert) => (
            <AlertCard
              alert={alert}
              key={alert.id}
              onDelete={onDelete}
              onEdit={openEditDialog}
            />
          ))}
        </div>
      ) : (
        <Empty className="border border-border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon icon={Alert01Icon} strokeWidth={2} />
            </EmptyMedia>
            <EmptyTitle>No alerts yet</EmptyTitle>
            <EmptyDescription>
              Create a price alert to get an email when a stock crosses your
              target.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={openCreateDialog}>
              <HugeiconsIcon
                icon={Add01Icon}
                strokeWidth={2}
                data-icon="inline-start"
              />
              Create alert
            </Button>
          </EmptyContent>
        </Empty>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[min(92vh,900px)] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Price Alert</DialogTitle>
            <DialogDescription>
              Choose a stock, threshold, and check frequency.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="alert-name">Alert name</FieldLabel>
                <Input
                  id="alert-name"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Apple at Discount"
                  required
                  value={form.name}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="alert-symbol">Stock identifier</FieldLabel>
                <Command className="border border-border">
                  <CommandInput
                    id="alert-symbol"
                    onValueChange={updateStockQuery}
                    placeholder="Search stocks by name or ticker..."
                    value={stockQuery}
                  />
                  {!selectedStock && stockQuery.trim().length >= 2 && (
                    <CommandList>
                      {searchingStocks ? (
                        <CommandEmpty>Searching stocks...</CommandEmpty>
                      ) : stockSearchError ? (
                        <CommandEmpty>{stockSearchError}</CommandEmpty>
                      ) : (
                        <CommandEmpty>No stocks found.</CommandEmpty>
                      )}
                      {stockResults.length > 0 && (
                        <CommandGroup>
                          {stockResults.map((stock) => (
                            <CommandItem
                              key={`${stock.exchange}-${stock.providerSymbol}`}
                              value={`${stock.name} ${stock.ticker} ${stock.exchange}`}
                              onSelect={() => selectStock(stock)}
                            >
                              <div className="flex min-w-0 flex-1 flex-col gap-1">
                                <div className="flex min-w-0 items-center justify-between gap-3">
                                  <span className="truncate font-medium">
                                    {stock.name}
                                  </span>
                                  <span className="shrink-0 font-semibold">
                                    {stock.ticker}
                                  </span>
                                </div>
                                <div className="flex min-w-0 items-center gap-3 text-xs text-muted-foreground">
                                  <span className="truncate">
                                    {stock.exchange || stock.type}
                                  </span>
                                  <span className="shrink-0">
                                    {stock.price === null
                                      ? "Price unavailable"
                                      : `Current ${formatPrice(stock.price)}`}
                                  </span>
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}
                    </CommandList>
                  )}
                </Command>
              </Field>

              <Field>
                <FieldLabel htmlFor="alert-condition">Condition</FieldLabel>
                <Select
                  items={conditionItems}
                  value={form.condition}
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      condition: value as AlertCondition,
                    }))
                  }
                >
                  <SelectTrigger id="alert-condition" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {conditionItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor="alert-threshold">
                  Threshold value
                </FieldLabel>
                <Input
                  id="alert-threshold"
                  min="0"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      threshold: Number(event.target.value),
                    }))
                  }
                  placeholder="140"
                  required
                  step="0.01"
                  type="number"
                  value={form.threshold || ""}
                />
                <FieldDescription>
                  {!selectedStock
                    ? "Select a stock to see its current price."
                    : selectedStock.price === null
                      ? "Finnhub did not return a current price for this stock."
                      : `Current price: ${formatPrice(selectedStock?.price ?? 0)}`}
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="alert-frequency">Frequency</FieldLabel>
                <Select
                  items={frequencyItems}
                  value={form.frequency}
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      frequency: value as AlertFrequency,
                    }))
                  }
                >
                  <SelectTrigger id="alert-frequency" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {frequencyItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              {error && <FieldError>{error}</FieldError>}

              <Button
                disabled={
                  saving || !selectedStock || selectedStock.price === null
                }
                type="submit"
              >
                {saving ? "Saving" : form.id ? "Update Alert" : "Create Alert"}
              </Button>
            </FieldGroup>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

function AlertCard({
  alert,
  onDelete,
  onEdit,
}: {
  alert: AlertCardItem
  onDelete: (id: string) => Promise<void>
  onEdit: (alert: AlertCardItem) => void
}) {
  const quote = alert.quote
  const positive = (quote?.percentChange ?? 0) >= 0

  return (
    <Card size="sm" className="min-h-72">
      <CardHeader>
        <div className="flex min-w-0 items-start gap-4">
          <Avatar size="lg">
            {alert.profile.logo && (
              <AvatarImage src={alert.profile.logo} alt="" />
            )}
            <AvatarFallback>
              {getDisplayStockSymbol(alert.stockSymbol).slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate normal-case">
              {alert.profile.name}
            </CardTitle>
            <CardDescription>{alert.name}</CardDescription>
          </div>
        </div>
        <CardAction>
          <div className="flex items-center gap-2">
            <Button
              aria-label={`Edit ${alert.name}`}
              onClick={() => onEdit(alert)}
              size="icon-sm"
              variant="ghost"
            >
              <HugeiconsIcon icon={PencilEdit02Icon} strokeWidth={2} />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button
                    aria-label={`Delete ${alert.name}`}
                    size="icon-sm"
                    variant="ghost"
                  />
                }
              >
                <HugeiconsIcon icon={Delete01Icon} strokeWidth={2} />
              </AlertDialogTrigger>
              <AlertDialogContent size="sm">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete alert?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove {alert.name} from your price alerts.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    onClick={() => void onDelete(alert.id)}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-3xl font-semibold text-foreground">
              {quote ? formatPrice(quote.price) : "--"}
            </p>
            {quote && (
              <Badge variant={positive ? "default" : "destructive"}>
                {positive ? "+" : ""}
                {quote.percentChange.toFixed(1)}%
              </Badge>
            )}
          </div>
          <Badge variant="secondary">
            {getDisplayStockSymbol(alert.stockSymbol)}
          </Badge>
        </div>

        <Separator />

        <div className="flex flex-col gap-2">
          <CardDescription>Alert</CardDescription>
          <p className="text-xl font-semibold text-foreground">
            {formatAlertCondition(alert.condition, alert.threshold)}
          </p>
        </div>
      </CardContent>

      <CardFooter className="justify-end">
        <Badge variant="secondary">
          {alertFrequencyLabels[alert.frequency]}
        </Badge>
      </CardFooter>
    </Card>
  )
}

"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { updateMarketDigestSettings } from "@/actions/notifications"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  marketDigestCountries,
  marketDigestHourOptions,
} from "@/lib/market-digest"

type NotificationSettingsFormProps = {
  accountEmail: string
  alertEmail: string
  country: string
  marketDigestHour: number
}

export function NotificationSettingsForm({
  accountEmail,
  alertEmail,
  country,
  marketDigestHour,
}: NotificationSettingsFormProps) {
  const router = useRouter()
  const [email, setEmail] = React.useState(alertEmail)
  const [selectedCountry, setSelectedCountry] = React.useState(country)
  const [selectedHour, setSelectedHour] = React.useState(
    String(marketDigestHour)
  )
  const [error, setError] = React.useState<string | null>(null)
  const [saved, setSaved] = React.useState(false)
  const [saving, setSaving] = React.useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSaved(false)
    setSaving(true)

    try {
      await updateMarketDigestSettings({
        alertEmail: email,
        country: selectedCountry,
        marketDigestHour: Number(selectedHour),
      })
      setSaved(true)
      router.refresh()
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to update market digest settings."
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Notification settings</CardTitle>
        <CardDescription>
          Price alerts and daily market digests will be sent to this address.
          Defaults to {accountEmail}.
        </CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent>
          <FieldGroup>
            <Field data-invalid={Boolean(error)}>
              <FieldLabel htmlFor="alert-email">Alert email</FieldLabel>
              <Input
                id="alert-email"
                aria-invalid={Boolean(error)}
                onChange={(event) => setEmail(event.target.value)}
                required
                type="email"
                value={email}
              />
              <FieldDescription>
                Price alerts and market digests will be sent to this address.
              </FieldDescription>
              {error && <FieldError>{error}</FieldError>}
            </Field>
            <Field>
              <FieldLabel>Country</FieldLabel>
              <Select
                onValueChange={(nextCountry) => {
                  if (nextCountry) {
                    setSelectedCountry(nextCountry)
                  }
                }}
                value={selectedCountry}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="start">
                  {marketDigestCountries.map((option) => (
                    <SelectItem key={option.code} value={option.code}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldDescription>
                Headlines will be selected for this country.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel>Digest time</FieldLabel>
              <Select
                onValueChange={(nextHour) => {
                  if (nextHour) {
                    setSelectedHour(nextHour)
                  }
                }}
                value={selectedHour}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="start">
                  {marketDigestHourOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldDescription>
                The selected hour is interpreted using the country timezone.
              </FieldDescription>
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="mt-6 gap-3">
          <Button disabled={saving} type="submit">
            {saved
              ? "Saved digest settings"
              : saving
                ? "Saving settings"
                : "Save settings"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

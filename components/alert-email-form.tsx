"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { updateAlertEmailSetting } from "@/actions/alerts"
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

type AlertEmailFormProps = {
  accountEmail: string
  alertEmail: string
}

export function AlertEmailForm({
  accountEmail,
  alertEmail,
}: AlertEmailFormProps) {
  const router = useRouter()
  const [email, setEmail] = React.useState(alertEmail)
  const [error, setError] = React.useState<string | null>(null)
  const [saved, setSaved] = React.useState(false)
  const [saving, setSaving] = React.useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSaved(false)
    setSaving(true)

    try {
      await updateAlertEmailSetting(email)
      setSaved(true)
      router.refresh()
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to update alert email."
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Alert delivery email</CardTitle>
        <CardDescription>Defaults to {accountEmail}.</CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent>
          <FieldGroup>
            <Field data-invalid={Boolean(error)}>
              <FieldLabel htmlFor="alert-email">Email address</FieldLabel>
              <Input
                id="alert-email"
                aria-invalid={Boolean(error)}
                onChange={(event) => setEmail(event.target.value)}
                required
                type="email"
                value={email}
              />
              <FieldDescription>
                Alert notifications will be sent to this address.
              </FieldDescription>
              {error && <FieldError>{error}</FieldError>}
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="gap-3 mt-6">
          <Button disabled={saving} type="submit">
            {saved ? "Saved email" : saving ? "Saving email" : "Save email"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

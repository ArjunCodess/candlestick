"use client"

import { EyeIcon, EyeOffIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

type AuthFormProps = {
  description: string
  footer: React.ReactNode
  mode: "sign-in" | "sign-up"
  title: string
}

export function AuthForm({ description, footer, mode, title }: AuthFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackURL = searchParams.get("callbackURL") ?? "/dashboard"
  const [error, setError] = React.useState<string | null>(null)
  const [pendingProvider, setPendingProvider] = React.useState<
    "email" | "google" | null
  >(null)
  const [showPassword, setShowPassword] = React.useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setPendingProvider("email")

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get("email") ?? "")
    const password = String(formData.get("password") ?? "")
    const name = String(formData.get("name") ?? "")

    const result =
      mode === "sign-in"
        ? await authClient.signIn.email({
            email,
            password,
            callbackURL,
          })
        : await authClient.signUp.email({
            email,
            name,
            password,
            callbackURL,
          })

    setPendingProvider(null)

    if (result.error) {
      setError(result.error.message ?? "Authentication failed.")
      return
    }

    router.push(callbackURL)
    router.refresh()
  }

  async function onGoogle() {
    setError(null)
    setPendingProvider("google")

    const result = await authClient.signIn.social({
      provider: "google",
      callbackURL,
    })

    if (result.error) {
      setPendingProvider(null)
      setError(result.error.message ?? "Google authentication failed.")
    }
  }

  const isSignUp = mode === "sign-up"

  return (
    <div className="w-full max-w-sm">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal text-foreground">
          {title}
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>

      <Button
        className="mt-8 w-full"
        disabled={pendingProvider !== null}
        onClick={onGoogle}
        type="button"
        variant="outline"
      >
        <Image
          src="/google.svg"
          alt=""
          width={16}
          height={16}
          aria-hidden="true"
        />
        {pendingProvider === "google" ? "Opening Google" : "Continue with Google"}
      </Button>

      <div className="my-6 flex items-center gap-3 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
        <div className="h-px flex-1 bg-border" />
        <span>Email</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <form className="grid gap-4" onSubmit={onSubmit}>
        {isSignUp && (
          <Field
            autoComplete="name"
            label="Name"
            name="name"
            placeholder="Alex Rivera"
            required
            type="text"
          />
        )}
        <Field
          autoComplete="email"
          label="Email"
          name="email"
          placeholder="you@example.com"
          required
          type="email"
        />
        <PasswordField
          autoComplete={isSignUp ? "new-password" : "current-password"}
          label="Password"
          minLength={8}
          name="password"
          required
          showPassword={showPassword}
          togglePassword={() => setShowPassword((visible) => !visible)}
        />
        {error && (
          <p className="border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        <Button disabled={pendingProvider !== null} type="submit">
          {pendingProvider === "email"
            ? isSignUp
              ? "Creating account"
              : "Signing in"
            : isSignUp
              ? "Create account"
              : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>
    </div>
  )
}

function PasswordField({
  className,
  label,
  showPassword,
  togglePassword,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string
  showPassword: boolean
  togglePassword: () => void
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-foreground">
      <span>{label}</span>
      <span className="relative block">
        <input
          className={cn(
            "h-10 w-full border border-input bg-background px-3 pr-11 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30",
            className
          )}
          type={showPassword ? "text" : "password"}
          {...props}
        />
        <button
          aria-label={showPassword ? "Hide password" : "Show password"}
          className="absolute top-1/2 right-1 inline-flex size-8 -translate-y-1/2 items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-none"
          onClick={togglePassword}
          type="button"
        >
          <HugeiconsIcon
            icon={showPassword ? EyeOffIcon : EyeIcon}
            strokeWidth={1.8}
            className="size-4"
          />
        </button>
      </span>
    </label>
  )
}

function Field({
  className,
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-foreground">
      <span>{label}</span>
      <input
        className={cn(
          "h-10 border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30",
          className
        )}
        {...props}
      />
    </label>
  )
}

import Link from "next/link"
import type { Metadata } from "next"
import { Suspense } from "react"

import { AuthForm } from "@/components/auth-form"

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in to Candlestick to manage your watchlist, dashboard, and stock alerts.",
}

export default function SignInPage() {
  return (
    <Suspense>
      <AuthForm
        mode="sign-in"
        title="Sign in to your watchlist"
        description="Track market moves, saved setups, and candlestick signals from your dashboard."
        footer={
          <>
            New to Candlestick?{" "}
            <Link
              className="text-primary underline-offset-4 hover:underline"
              href="/sign-up"
            >
              Create an account
            </Link>
          </>
        }
      />
    </Suspense>
  )
}

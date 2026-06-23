import Link from "next/link"
import { Suspense } from "react"

import { AuthForm } from "@/components/auth-form"

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

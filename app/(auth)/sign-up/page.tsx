import Link from "next/link"
import type { Metadata } from "next"
import { Suspense } from "react"

import { AuthForm } from "@/components/auth-form"

export const metadata: Metadata = {
  title: "Create Account",
  description:
    "Create a Candlestick account to track stocks, save watchlists, and receive price alerts.",
}

export default function SignUpPage() {
  return (
    <Suspense>
      <AuthForm
        mode="sign-up"
        title="Create your market workspace"
        description="Build a stock watchlist, follow price action, and keep your trading research organized."
        footer={
          <>
            Already have an account?{" "}
            <Link
              className="text-primary underline-offset-4 hover:underline"
              href="/sign-in"
            >
              Sign in
            </Link>
          </>
        }
      />
    </Suspense>
  )
}

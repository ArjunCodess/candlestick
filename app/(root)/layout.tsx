import { DashboardSettingsBanner } from "@/components/dashboard-settings-banner"
import { Header } from "@/components/header"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <main className="min-h-screen text-gray-400">
      <Header />
      <DashboardSettingsBanner />
      <div className="mx-auto max-w-screen-2xl px-4 py-10 md:px-6 lg:px-8">
        {children}
      </div>
    </main>
  )
}

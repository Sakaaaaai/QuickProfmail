import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"
import Image from "next/image"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "QuickProfMail",
  description: "教授へのメール作成を効率化するテンプレートマネージャー",
  generator: 'v0.dev',
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
          storageKey="theme-mode"
        >
          <div className="container mx-auto p-4">
            <header className="flex items-center gap-3 mb-8">
              <Image src="/logo.png" alt="QuickProfMail" width={48} height={48} />
              <h1 className="text-3xl font-bold text-green-600">QuickProfMail</h1>
            </header>
            {children}
          </div>
          <Toaster richColors />
        </ThemeProvider>
      </body>
    </html>
  )
}
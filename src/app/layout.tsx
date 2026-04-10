import type { Metadata } from "next"
import { DM_Sans, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { StoreProvider } from "@/lib/store"
import { ToastProvider } from "@/components/ui/toast"

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
})

export const metadata: Metadata = {
  title: "CyberCut — Sistema de Barbearia",
  description: "Sistema completo de gestão para barbearias com agendamento, controle financeiro e gestão de clientes.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${dmSans.variable} ${jetbrainsMono.variable} h-full`}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full font-[family-name:var(--font-dm-sans)] noise">
        <ToastProvider>
          <StoreProvider>
            {children}
          </StoreProvider>
        </ToastProvider>
      </body>
    </html>
  )
}

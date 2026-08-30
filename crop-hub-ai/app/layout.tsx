import { ThemeProvider } from 'next-themes'
import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'
import './print.css'

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: 'CropHub AI — Smart Agronomy & Market Intelligence',
  description:
    'AI-powered crop recommendations grounded in soil parameters, live OpenWeatherMap climate data, and APMC mandi prices — for Maharashtra farmers and market administrators. Smart India Hackathon 2026.',
  generator: 'Next.js',
  keywords: ['crop recommendation', 'agritech', 'Maharashtra', 'APMC', 'farmers', 'SIH 2026', 'soil analysis'],
  authors: [{ name: 'CropHub AI Team' }],
  openGraph: {
    title: 'CropHub AI — Smart Agronomy & Market Intelligence',
    description:
      'AI-powered crop recommendations grounded in soil parameters, live climate data, and APMC mandi prices for Maharashtra farmers.',
    url: 'https://crophub-ai.vercel.app',
    siteName: 'CropHub AI',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CropHub AI — Smart Agronomy & Market Intelligence',
    description: 'AI-powered crop recommendations for Maharashtra farmers. Built for Smart India Hackathon 2026.',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CropHub AI',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#154212' },
    { media: '(prefers-color-scheme: dark)', color: '#0a1f0a' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-right" />
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </ThemeProvider>
      </body>
    </html>
  )
}

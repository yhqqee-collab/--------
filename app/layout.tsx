import { Analytics } from '@vercel/analytics/next'
import { SITE } from '@/lib/template-config'
import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { Noto_Sans_KR } from 'next/font/google'
import './globals.css'

const notoKr = Noto_Sans_KR({ subsets: ['latin'], variable: '--font-kr' })

export const metadata: Metadata = {
  title: SITE.title,
  description: SITE.description,
  generator: 'v0.app',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0b070c',
  width: 'device-width',
  initialScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className={`${notoKr.variable} bg-[#0b070c]`}>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
        {/* Cloudflare Web Analytics */}
        {process.env.NODE_ENV === 'production' && (
          <Script
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon='{"token": "06076b78fff244ab88b5280c8d769320"}'
            strategy="afterInteractive"
          />
        )}
        {/* End Cloudflare Web Analytics */}
      </body>
    </html>
  )
}

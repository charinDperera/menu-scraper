import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'

export const metadata: Metadata = {
  title: 'Menu Scraper - Applova',
  description: 'Upload your restaurant menu and automatically extract products with our intelligent menu scraper tool.',
  keywords: 'menu scraper, restaurant menu, product extraction, menu digitization, Applova',
  authors: [{ name: 'Applova' }],
  creator: 'Applova',
  publisher: 'Applova',
  robots: 'index, follow',
  openGraph: {
    title: 'Menu Scraper - Applova',
    description: 'Upload your restaurant menu and automatically extract products with our intelligent menu scraper tool.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Menu Scraper - Applova',
    description: 'Upload your restaurant menu and automatically extract products with our intelligent menu scraper tool.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        {children}
      </body>
    </html>
  )
}

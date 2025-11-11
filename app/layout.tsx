import type { Metadata } from 'next'
import './globals.css'
import Navigation from '@/components/Navigation'

export const metadata: Metadata = {
  title: 'SEO Toolkit',
  description: 'Comprehensive SEO analysis toolkit',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Navigation />
        <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
          {children}
        </main>
      </body>
    </html>
  )
}


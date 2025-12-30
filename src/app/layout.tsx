import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Enroll IQ - Smart Enrollment Platform',
  description: 'Streamline your university enrollment process with Enroll IQ',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-pattern min-h-screen">
        {children}
      </body>
    </html>
  )
}


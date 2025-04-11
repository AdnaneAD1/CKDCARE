'use client';

import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

export default function RootLayout({ children }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <title>CKDCARE - Gestion des patients MRC</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content="Plateforme médicale dédiée à la gestion des patients atteints de Maladie Rénale Chronique (MRC)" />
        <link 
          rel="stylesheet" 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          crossOrigin="anonymous"
        />
      </head>
      <body className="font-sans">
        <ThemeProvider 
          attribute="class" 
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
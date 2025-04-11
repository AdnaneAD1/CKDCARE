'use client';

import { ThemeProvider } from '@/components/theme-provider'
import '../globals.css'
import { Toaster } from '@/components/ui/toaster'

export default function Layout({ children }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <title>CKDCARE - Gestion des patients MRC</title>
        <meta name="description" content="Plateforme médicale dédiée à la gestion des patients atteints de Maladie Rénale Chronique (MRC)" />
        <link rel="icon" href="/favicon.ico" />
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
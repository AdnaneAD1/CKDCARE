'use client';

import { ThemeProvider } from '@/components/theme-provider'
import '../globals.css'
import { Toaster } from '@/components/ui/toaster'
import { useAuth } from '@/hooks/auth'
import { Preloader } from '@/components/ui/preloader'

const DashboardLayout = ({ children }) => {
    const { user } = useAuth({ middleware: 'auth' })

    return (
        <html lang="fr" suppressHydrationWarning>
            <head>
                <title>CKDCARE - Gestion des patients MRC</title>
                <link rel="icon" href="/favicon.ico" />
                <meta name="description" content="Plateforme médicale dédiée à la gestion des patients atteints de Maladie Rénale Chronique (MRC)" />
            </head>
            <body className="font-sans">
                <ThemeProvider 
                    attribute="class" 
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <div>
                        {!user ? <Preloader /> : children}
                        <Toaster />
                    </div>
                </ThemeProvider>
            </body>
        </html>
    )
}

export default DashboardLayout
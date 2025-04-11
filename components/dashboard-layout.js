'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image';
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Bell,
  Settings,
  LogOut,
  GitBranch,
  Menu,
  Shield
} from 'lucide-react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ResponsiveWrapper } from './responsive-wrapper'
import { MobileNavigation } from './mobile-navigation'
import { useSwipeable } from 'react-swipeable'
import { motion, AnimatePresence } from 'framer-motion'
import { useDeviceType } from '@/hooks/use-device-type'
import { useUserRole } from '@/hooks/use-user-role'
import { useAuth } from '@/hooks/auth'

export default function DashboardLayout({ children }) {
  const deviceType = useDeviceType()
  const [isSidebarOpen, setIsSidebarOpen] = useState(deviceType === 'desktop')
  const router = useRouter()
  const pathname = usePathname()
  const { isAdmin } = useUserRole()

  useEffect(() => {
    setIsSidebarOpen(deviceType === 'desktop')
  }, [deviceType])

  const handlers = useSwipeable({
    onSwipedRight: () => setIsSidebarOpen(true),
    onSwipedLeft: () => setIsSidebarOpen(false),
    trackMouse: true
  });

  const { logout } = useAuth()
  
  const handleLogout = () => {
    logout()
  }

  const isActive = (path) => {
    if (path === '/dashboard') {
      return pathname === path
    }
    return pathname.startsWith(path)
  }

  const navigationItems = [
    {
      href: '/dashboard',
      icon: LayoutDashboard,
      label: 'Tableau de Bord'
    },
    {
      href: '/patients',
      icon: Users,
      label: 'Patients'
    },
    {
      href: '/dossiers',
      icon: FileText,
      label: 'Dossiers Médicaux'
    },
    {
      href: '/workflows',
      icon: GitBranch,
      label: 'Workflows'
    },
    {
      href: '/notifications',
      icon: Bell,
      label: 'Notifications'
    },
    {
      href: '/parametres',
      icon: Settings,
      label: 'Paramètres'
    },
    // Option d'administration uniquement visible pour les admins
    ...(isAdmin() ? [{
      href: '/admin',
      icon: Shield,
      label: 'Administration'
    }] : [])
  ]

  const handleNavClick = () => {
    if (deviceType === 'mobile') {
      setIsSidebarOpen(false)
    }
  }

  const DesktopSidebar = (
    <aside 
      className={cn(
        "fixed inset-y-0 left-0 bg-card shadow-lg w-64 transform transition-transform duration-200 ease-in-out border-r border-border z-30",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-border bg-secondary">
        <Image 
          src="/logo.png" // Chemin de l'image dans /public
          alt="Logo"
          width={150} // Largeur du logo
          height={150} // Hauteur du logo
        />
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden text-primary-foreground"
          onClick={() => setIsSidebarOpen(false)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>
      <nav className="mt-6 px-4">
        {navigationItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center px-4 py-2 mt-2 rounded-lg transition-colors",
                isActive(item.href)
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-accent hover:text-accent-foreground"
              )}
              onClick={handleNavClick}
            >
              <Icon className="h-5 w-5 mr-3" />
              {item.label}
            </Link>
          )
        })}
        <Button 
          variant="ghost" 
          className="flex items-center px-4 py-2 mt-8 text-destructive hover:bg-destructive/10 rounded-lg w-full"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Déconnexion
        </Button>
      </nav>
    </aside>
  )

  const MobileHeader = (
    <header className="fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-20 flex items-center px-4">
      <Button
        variant="ghost"
        size="icon"
        className="mr-4"
        onClick={() => setIsSidebarOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>
      <Image 
        src="/logo.png" // Chemin de l'image dans /public
        alt="Logo"
        width={100} // Largeur du logo
        height={100} // Hauteur du logo
      />
    </header>
  )

  const mobileLayout = (
    <>
      {MobileHeader}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-20"
              onClick={() => setIsSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-64 z-30"
            >
              {DesktopSidebar}
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <main className="pt-16 pb-16">
        <div className="p-4">
          {children}
        </div>
      </main>
      <MobileNavigation />
    </>
  )

  const desktopLayout = (
    <>
      {DesktopSidebar}
      <main className={cn(
        "transition-all duration-200 ease-in-out min-h-screen bg-background",
        isSidebarOpen ? "ml-64" : "ml-0"
      )}>
        <div className="p-8">
          {children}
        </div>
      </main>
    </>
  )

  return (
    <div className="min-h-screen bg-background" {...handlers}>
      <ResponsiveWrapper
        mobile={mobileLayout}
        tablet={mobileLayout}
        desktop={desktopLayout}
      />
    </div>
  )
}
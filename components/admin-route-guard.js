'use client'

import { useEffect, Fragment } from 'react'
import { useRouter } from 'next/navigation'
import { useUserRole } from '@/hooks/use-user-role'
import { useToast } from '@/hooks/use-toast'
import { Preloader } from '@/components/ui/preloader'

export default function AdminRouteGuard({ children }) {
  const { isAdmin, user } = useUserRole()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Wait for user data to load
    if (user === undefined) return
    
    // If user is not admin, redirect to dashboard
    if (!isAdmin()) {
      toast({
        title: "Accès refusé",
        description: "Vous n'avez pas les droits d'accès à cette page.",
        variant: "destructive"
      })
      router.push('/dashboard')
    }
  }, [user, router, toast, isAdmin])

  // While checking permissions, return the preloader
  if (user === undefined) {
    return <Preloader />
  }

  // If user is admin, render children
  return isAdmin() ? <Fragment>{children}</Fragment> : null
}

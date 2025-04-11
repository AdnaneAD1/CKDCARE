'use client'

import { useAuth } from './auth'

export const useUserRole = () => {
  const { user } = useAuth({ middleware: 'auth' })

  const isAdmin = () => {
    return user?.role === 'admin'
  }

  const isMedecin = () => {
    return user?.role === 'medecin'
  }

  return {
    isAdmin,
    isMedecin,
    user
  }
}

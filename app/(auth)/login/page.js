'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/hooks/auth'
import { useRouter } from 'next/navigation'
import AuthSessionStatus from '@/app/(auth)/AuthSessionStatus'
import Link from 'next/link'

const LoginPage = () => {
    const router = useRouter()

    const { login } = useAuth({
        middleware: 'guest',
        redirectIfAuthenticated: '/dashboard',
    })

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [errors, setErrors] = useState([])
    const [status, setStatus] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    const submitForm = async event => {
        event.preventDefault()
        setIsLoading(true)

        login({
            email,
            password,
            setErrors,
            setStatus,
        }).finally(() => {
            setIsLoading(false)
        })
    }

    useEffect(() => {
        if (router.reset?.length > 0 && errors.length === 0) {
            setStatus(atob(router.reset))
        } else {
            setStatus(null)
        }
    })

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Retour à l'accueil
                </Link>
                
                <Card className="shadow-lg">
                    <CardHeader className="space-y-1 text-center">
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <CardTitle className="text-2xl font-bold tracking-tight">
                                Accès Professionnel
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Plateforme de gestion des patients MRC
                            </p>
                        </motion.div>
                    </CardHeader>
                    <CardContent>
                        <AuthSessionStatus className="mb-4" status={status} />
                        <motion.form
                            onSubmit={submitForm}
                            className="space-y-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            <div className="space-y-2">
                                <Input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    className="block mt-1 w-full"
                                    onChange={event => setEmail(event.target.value)}
                                    required
                                    autoFocus
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-600">{errors.email}</p>
                                )}
                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Mot de passe"
                                        value={password}
                                        className="block mt-1 w-full pr-10"
                                        onChange={event => setPassword(event.target.value)}
                                        required
                                        autoComplete="current-password"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4 text-gray-500" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-gray-500" />
                                        )}
                                    </Button>
                                </div>
                                {errors.password && (
                                    <p className="text-sm text-red-600">{errors.password}</p>
                                )}
                            </div>
                            <Button 
                                type="submit" 
                                className="w-full bg-blue-600 hover:bg-blue-700" 
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                                        Connexion en cours...
                                    </>
                                ) : (
                                    <>
                                        <Lock className="mr-2 h-4 w-4" />
                                        Accéder au dossier médical
                                    </>
                                )}
                            </Button>
                        </motion.form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}

export default LoginPage
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2 } from 'lucide-react';

export default function VerifyEmailPage() {
    const { logout, resendEmailVerification } = useAuth({
        middleware: 'auth',
        redirectIfAuthenticated: '/dashboard',
    });

    const [status, setStatus] = useState(null);

    return (
        <div className="container flex h-screen w-screen flex-col items-center justify-center">
            <Card className="w-[400px] max-w-[90%]">
                <CardHeader>
                    <CardTitle>Vérification de l&apos;email</CardTitle>
                    <CardDescription>
                        Merci de votre inscription ! Avant de commencer, pourriez-vous vérifier votre adresse email en cliquant sur le lien que nous venons de vous envoyer ?
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {status === 'verification-link-sent' && (
                        <Alert className="border-green-200 bg-green-100 text-green-800">
                            <CheckCircle2 className="h-4 w-4" />
                            <AlertDescription>
                                Un nouveau lien de vérification a été envoyé à l&apos;adresse email que vous avez fournie lors de l&apos;inscription.
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="flex items-center justify-between">
                        <Button 
                            onClick={() => resendEmailVerification({ setStatus })}
                            variant="default"
                        >
                            Renvoyer l&apos;email
                        </Button>

                        <Button
                            variant="ghost"
                            onClick={logout}
                        >
                            Déconnexion
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

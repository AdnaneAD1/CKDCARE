'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Bell, Shield, Palette, Eye, EyeOff } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { cn } from '@/lib/utils';
import { useDeviceType } from '@/hooks/use-device-type';
import { useMedecin } from '@/hooks/use-medecin';
import { useAuth } from '@/hooks/auth';

export default function ParametresPage() {
  const { toast } = useToast();
  const deviceType = useDeviceType();
  const isMobile = deviceType === 'mobile';
  const { medecin, isLoading, updateMedecinProfile, updatePassword } = useMedecin();
  const { user } = useAuth();

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [notifications, setNotifications] = useState({
    email: true,
    desktop: true,
    urgent: true
  });

  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    specialite: ''
  });

  const [passwords, setPasswords] = useState({
    current_password: '',
    password: '',
    password_confirmation: ''
  });

  const [theme, setTheme] = useState('light');

  // Mettre à jour les informations utilisateur lorsque les données de l'utilisateur connecté sont chargées
  useEffect(() => {
    if (user) {
      setUserInfo(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  // Mettre à jour les informations utilisateur lorsque les données du médecin sont chargées
  useEffect(() => {
    if (medecin) {
      setUserInfo(prev => ({
        ...prev,
        specialite: medecin.specialite || ''
      }));
      
      setNotifications({
        email: medecin.preferences_notifications?.email || false,
        desktop: medecin.preferences_notifications?.desktop || false,
        urgent: medecin.preferences_notifications?.urgent || false
      });
    }
  }, [medecin]);

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSaveProfile = async () => {
    const profileData = {
      name: userInfo.name,
      email: userInfo.email,
      specialite: userInfo.specialite,
      preferences_notifications: {
        email: notifications.email,
        desktop: notifications.desktop,
        urgent: notifications.urgent
      }
    };
    
    setIsUpdatingProfile(true);
    try {
      await updateMedecinProfile(profileData);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwords.password !== passwords.password_confirmation) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive"
      });
      return;
    }
    if (passwords.password.length < 8) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 8 caractères",
        variant: "destructive"
      });
      return;
    }
    
    setIsChangingPassword(true);
    try {
      const success = await updatePassword(passwords);
      if (success) {
        setPasswords({ current_password: '', password: '', password_confirmation: '' });
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(newTheme);
    toast({
      title: "Thème modifié",
      description: `Le thème ${newTheme} a été appliqué`,
    });
  };

  const handleNotificationChange = (type, checked) => {
    setNotifications(prev => ({ ...prev, [type]: checked }));
  };


  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Paramètres</h1>
        <p className="text-muted-foreground">Gérez vos préférences et paramètres de compte</p>
      </div>

      <Tabs defaultValue="compte" className="space-y-4">
        <TabsList className={cn(
          "w-full justify-start",
          isMobile && "overflow-x-auto flex-nowrap"
        )}>
          <TabsTrigger value="compte" className="flex items-center">
            <User className="h-4 w-4 mr-2" />
            <span className={cn(isMobile && "hidden")}>Compte</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center">
            <Bell className="h-4 w-4 mr-2" />
            <span className={cn(isMobile && "hidden")}>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="securite" className="flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            <span className={cn(isMobile && "hidden")}>Sécurité</span>
          </TabsTrigger>
          <TabsTrigger value="apparence" className="flex items-center">
            <Palette className="h-4 w-4 mr-2" />
            <span className={cn(isMobile && "hidden")}>Apparence</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="compte">
          <Card>
            <CardHeader>
              <CardTitle>Informations du Compte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet</Label>
                <Input
                  id="name"
                  value={userInfo.name}
                  onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={userInfo.email}
                  onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialite">Spécialité</Label>
                <Input
                  id="specialite"
                  value={userInfo.specialite}
                  onChange={(e) => setUserInfo({ ...userInfo, specialite: e.target.value })}
                  required
                />
              </div>
              <Button
                onClick={handleSaveProfile}
                className={cn(isMobile && "w-full")}
                disabled={isUpdatingProfile}
              >
                {isUpdatingProfile ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" fill="currentColor" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S16.627 6 12 6z" />
                    </svg>
                    Enregistrement en cours...
                  </div>
                ) : (
                  "Sauvegarder les modifications"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Préférences de Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className={cn(
                "flex items-center justify-between",
                isMobile && "flex-col items-start gap-4"
              )}>
                <div className="space-y-0.5">
                  <Label>Notifications par email</Label>
                  <p className="text-sm text-muted-foreground">
                    Recevoir les notifications par email
                  </p>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                />
              </div>
              <div className={cn(
                "flex items-center justify-between",
                isMobile && "flex-col items-start gap-4"
              )}>
                <div className="space-y-0.5">
                  <Label>Notifications bureau</Label>
                  <p className="text-sm text-muted-foreground">
                    Afficher les notifications sur le bureau
                  </p>
                </div>
                <Switch
                  checked={notifications.desktop}
                  onCheckedChange={(checked) => handleNotificationChange('desktop', checked)}
                />
              </div>
              <div className={cn(
                "flex items-center justify-between",
                isMobile && "flex-col items-start gap-4"
              )}>
                <div className="space-y-0.5">
                  <Label>Alertes urgentes</Label>
                  <p className="text-sm text-muted-foreground">
                    Notifications pour les cas urgents
                  </p>
                </div>
                <Switch
                  checked={notifications.urgent}
                  onCheckedChange={(checked) => handleNotificationChange('urgent', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="securite">
          <Card>
            <CardHeader>
              <CardTitle>Sécurité du Compte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Mot de passe actuel</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showPasswords.current ? "text" : "password"}
                    value={passwords.current_password}
                    className="pr-10"
                    onChange={(e) => setPasswords({ ...passwords, current_password: e.target.value })}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility('current')}
                  >
                    {showPasswords.current ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">Nouveau mot de passe</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPasswords.new ? "text" : "password"}
                    value={passwords.password}
                    className="pr-10"
                    onChange={(e) => setPasswords({ ...passwords, password: e.target.value })}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility('new')}
                  >
                    {showPasswords.new ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwords.password_confirmation}
                    className="pr-10"
                    onChange={(e) => setPasswords({ ...passwords, password_confirmation: e.target.value })}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility('confirm')}
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>
              <Button
                onClick={handlePasswordChange}
                className={cn(isMobile && "w-full")}
                disabled={isChangingPassword}
              >
                {isChangingPassword ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" fill="currentColor" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S16.627 6 12 6z" />
                    </svg>
                    Modification en cours...
                  </div>
                ) : (
                  "Changer le mot de passe"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="apparence">
          <Card>
            <CardHeader>
              <CardTitle>Apparence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Label>Thème</Label>
                <div className={cn(
                  "flex gap-2",
                  isMobile ? "flex-col" : "flex-row"
                )}>
                  <Button
                    variant={theme === 'light' ? 'default' : 'outline'}
                    onClick={() => handleThemeChange('light')}
                    className={cn(isMobile && "w-full")}
                  >
                    Clair
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    onClick={() => handleThemeChange('dark')}
                    className={cn(isMobile && "w-full")}
                  >
                    Sombre
                  </Button>
                  <Button
                    variant={theme === 'system' ? 'default' : 'outline'}
                    onClick={() => handleThemeChange('system')}
                    className={cn(isMobile && "w-full")}
                  >
                    Système
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}

'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/dashboard-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { cn } from '@/lib/utils';
import { useDeviceType } from '@/hooks/use-device-type';

const mockNotifications = [
  {
    id: 1,
    type: 'urgent',
    title: 'Résultats Critiques',
    message: 'Résultats d\'analyse critiques pour le patient Dubois Marie',
    date: '15/01/2024 14:30',
    read: false
  },
  {
    id: 2,
    type: 'reminder',
    title: 'Rappel de Rendez-vous',
    message: 'Rendez-vous de suivi avec M. Martin Jean demain à 10h00',
    date: '15/01/2024 09:15',
    read: true
  },
  {
    id: 3,
    type: 'info',
    title: 'Mise à Jour Dossier',
    message: 'Nouveaux documents ajoutés au dossier de Mme Bernard Sophie',
    date: '14/01/2024 16:45',
    read: false
  }
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const { toast } = useToast();
  const deviceType = useDeviceType();
  const isMobile = deviceType === 'mobile';

  const getIcon = (type) => {
    switch (type) {
      case 'urgent':
        return <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />;
      case 'reminder':
        return <Clock className="h-5 w-5 text-blue-500 shrink-0" />;
      case 'info':
        return <Bell className="h-5 w-5 text-gray-500 shrink-0" />;
      default:
        return <Bell className="h-5 w-5 shrink-0" />;
    }
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
    toast({
      title: "Notification marquée comme lue",
      description: "La notification a été mise à jour",
    });
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
    toast({
      title: "Toutes les notifications ont été marquées comme lues",
      description: "Votre liste de notifications a été mise à jour",
    });
  };

  const handleNotificationClick = (notification) => {
    switch (notification.type) {
      case 'urgent':
        window.location.href = '/dossiers';
        break;
      case 'reminder':
        alert('Ouverture du calendrier de rendez-vous');
        break;
      case 'info':
        window.location.href = '/dossiers';
        break;
    }
  };

  return (
    <DashboardLayout>
      <div className={cn(
        "flex justify-between items-center",
        isMobile ? "mb-4 flex-col gap-3" : "mb-6"
      )}>
        <h1 className="text-2xl font-bold">Notifications</h1>
        <Button 
          variant="outline" 
          onClick={markAllAsRead}
          className={cn(isMobile && "w-full")}
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          Tout marquer comme lu
        </Button>
      </div>

      <div className="space-y-4">
        {notifications.map((notification) => (
          <Card 
            key={notification.id} 
            className={cn(
              notification.read ? 'opacity-75' : '',
              'hover:shadow-md transition-shadow cursor-pointer'
            )}
            onClick={() => handleNotificationClick(notification)}
          >
            <CardContent className={cn(
              "flex items-start p-4 md:p-6",
              isMobile ? "gap-3" : "gap-4"
            )}>
              <div className="mt-1">
                {getIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className={cn(
                  "flex items-center justify-between",
                  isMobile && "flex-col items-start gap-1"
                )}>
                  <h3 className="font-semibold truncate">{notification.title}</h3>
                  <span className="text-sm text-gray-500 shrink-0">{notification.date}</span>
                </div>
                <p className="mt-1 text-gray-600 line-clamp-2">{notification.message}</p>
              </div>
              {!notification.read && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={cn(
                    "shrink-0",
                    isMobile && "hidden"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    markAsRead(notification.id);
                  }}
                >
                  Marquer comme lu
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
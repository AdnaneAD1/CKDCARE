'use client';

import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import { useToast } from "@/components/ui/use-toast";

export function useDashboard() {
  const { toast } = useToast();
  const [dashboardData, setDashboardData] = useState({
    patients: {
      total: 0,
      byStage: { stade1: 0, stade2: 0, stade3: 0, stade4: 0, stade5: 0 }
    },
    alerts: {
      total: 0,
      items: []
    },
    appointments: {
      today: 0,
      upcoming: 0,
      items: []
    },
    evolution: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/dashboard');
      setDashboardData(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la récupération des données du dashboard';
      setError(errorMessage);
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      });
      console.error(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
    dashboardData,
    isLoading,
    error,
    fetchDashboardData
  };
}

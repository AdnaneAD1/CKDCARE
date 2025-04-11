'use client';

import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import { useToast } from "@/components/ui/use-toast";

export const useMedecin = () => {
  const { toast } = useToast();
  const [medecin, setMedecin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMedecinProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/medecin/profile');
      setMedecin(response.data.medecin);
      return response.data.medecin;
    } catch (err) {
      setError('Erreur lors de la récupération du profil médecin');
      console.error(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateMedecinProfile = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.put('/api/medecin/profile', data);
      setMedecin(response.data.medecin);
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées avec succès",
      });
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la mise à jour du profil';
      setError(errorMessage);
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      });
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (passwordData) => {
    setIsLoading(true);
    setError(null);
    try {
      await axios.put('/api/medecin/password', passwordData);
      toast({
        title: "Mot de passe modifié",
        description: "Votre mot de passe a été mis à jour avec succès",
      });
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la mise à jour du mot de passe';
      const validationErrors = err.response?.data?.errors;
      
      if (validationErrors) {
        // Afficher les erreurs de validation spécifiques
        const errorMessages = Object.values(validationErrors).flat().join(', ');
        setError(errorMessages);
        toast({
          title: "Erreur de validation",
          description: errorMessages,
          variant: "destructive"
        });
      } else {
        setError(errorMessage);
        toast({
          title: "Erreur",
          description: errorMessage,
          variant: "destructive"
        });
      }
      
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedecinProfile();
  }, []);

  return {
    medecin,
    isLoading,
    error,
    fetchMedecinProfile,
    updateMedecinProfile,
    updatePassword
  };
};

'use client';

import { useState, useCallback } from 'react';
import { useToast } from './use-toast';
import axios from '@/lib/axios';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function useAdmin() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  
  // Récupérer la liste des médecins
  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/admin/medecins');
      
      // Transformer les données pour correspondre à la structure attendue par le composant
      const formattedDoctors = response.data.medecins.map(doctor => ({
        id: doctor.id,
        nom: doctor.name.split(' ')[0] || doctor.name, // Supposant que le nom est au format "Nom Prénom"
        prenom: doctor.name.split(' ')[1] || '',
        email: doctor.email,
        specialite: doctor.specialite,
        dateCreation: format(new Date(doctor.created_at), 'dd/MM/yyyy', { locale: fr }),
        status: 'actif' // Par défaut, tous les médecins sont considérés comme actifs
      }));
      
      setDoctors(formattedDoctors);
    } catch (error) {
      console.error('Erreur lors de la récupération des médecins:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer la liste des médecins",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);
  
  // Ajouter un nouveau médecin
  const addDoctor = useCallback(async (doctorData) => {
    setLoading(true);
    try {
      // Adapter les données au format attendu par l'API
      const apiData = {
        name: `${doctorData.nom} ${doctorData.prenom}`,
        email: doctorData.email,
        password: doctorData.password,
        specialite: doctorData.specialite,
        preferences_notifications: [] // Par défaut, aucune préférence
      };
      
      const response = await axios.post('/api/admin/medecins', apiData);
      
      // Formater la réponse pour correspondre à la structure attendue
      const newDoctor = {
        id: response.data.medecin.id,
        nom: doctorData.nom,
        prenom: doctorData.prenom,
        email: doctorData.email,
        specialite: doctorData.specialite,
        dateCreation: format(new Date(), 'dd/MM/yyyy', { locale: fr }),
        status: 'actif'
      };
      
      // Mettre à jour la liste des médecins
      setDoctors(prev => [...prev, newDoctor]);
      
      toast({
        title: "Médecin ajouté",
        description: "Le nouveau médecin a été enregistré avec succès"
      });
      
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du médecin:', error);
      toast({
        title: "Erreur",
        description: error.response?.data?.errors ? Object.values(error.response.data.errors).flat().join(', ') : "Impossible d'ajouter le médecin",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);
  
  // Mettre à jour un médecin
  const updateDoctor = useCallback(async (id, doctorData) => {
    setLoading(true);
    try {
      // Adapter les données au format attendu par l'API
      const apiData = {
        name: `${doctorData.nom} ${doctorData.prenom}`,
        email: doctorData.email,
        specialite: doctorData.specialite,
        preferences_notifications: [] // Conserver les préférences existantes ou les mettre à jour si nécessaire
      };
      
      const response = await axios.put(`/api/admin/medecins/${id}`, apiData);
      
      // Mettre à jour la liste des médecins
      setDoctors(prev => prev.map(doc => 
        doc.id === id ? {
          ...doc,
          nom: doctorData.nom,
          prenom: doctorData.prenom,
          email: doctorData.email,
          specialite: doctorData.specialite
        } : doc
      ));
      
      toast({
        title: "Médecin modifié",
        description: "Les informations ont été mises à jour avec succès"
      });
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du médecin:', error);
      toast({
        title: "Erreur",
        description: error.response?.data?.errors ? Object.values(error.response.data.errors).flat().join(', ') : "Impossible de mettre à jour le médecin",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);
  
  // Supprimer un médecin
  const deleteDoctor = useCallback(async (id) => {
    setLoading(true);
    try {
      await axios.delete(`/api/admin/medecins/${id}`);
      
      // Mettre à jour la liste des médecins
      setDoctors(prev => prev.filter(doc => doc.id !== id));
      
      toast({
        title: "Médecin supprimé",
        description: "Le médecin a été supprimé avec succès"
      });
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du médecin:', error);
      
      // Message d'erreur spécifique si le médecin a des patients
      if (error.response?.status === 400 && error.response?.data?.message?.includes('patients')) {
        toast({
          title: "Erreur",
          description: "Impossible de supprimer ce médecin car il a des patients associés",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de supprimer le médecin",
          variant: "destructive"
        });
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);
  
  // Mettre à jour le mot de passe d'un médecin
  const updateDoctorPassword = useCallback(async (id, passwordData) => {
    setLoading(true);
    try {
      await axios.put(`/api/admin/medecins/${id}/password`, {
        password: passwordData.password,
        password_confirmation: passwordData.confirm
      });
      
      toast({
        title: "Mot de passe modifié",
        description: "Le mot de passe a été mis à jour avec succès"
      });
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du mot de passe:', error);
      toast({
        title: "Erreur",
        description: error.response?.data?.errors ? Object.values(error.response.data.errors).flat().join(', ') : "Impossible de mettre à jour le mot de passe",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);
  
  // Rechercher des médecins
  const searchDoctors = useCallback((searchTerm) => {
    if (!searchTerm || searchTerm.trim() === '') {
      // Si aucun terme de recherche, récupérer tous les médecins
      fetchDoctors();
      return;
    }
    
    // Filtrer les médecins localement (pour éviter des appels API inutiles)
    const filtered = doctors.filter(doctor => 
      doctor.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialite.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Mettre à jour l'état avec les résultats filtrés
    setDoctors(filtered);
  }, [doctors, fetchDoctors]);
  
  return {
    loading,
    doctors,
    fetchDoctors,
    addDoctor,
    updateDoctor,
    deleteDoctor,
    updateDoctorPassword,
    searchDoctors
  };
}

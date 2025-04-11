import { useState, useCallback } from 'react';
import axios from '@/lib/axios';

export const useDossiers = (patientId = null) => {
  const [dossiers, setDossiers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDossiers = useCallback(async (search = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (patientId) params.append('patient_id', patientId);

      const response = await axios.get(`/api/dossiers?${params.toString()}`);
      setDossiers(response.data.dossiers.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  const getDossier = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/dossiers/${id}`);
      return { success: true, data: response.data.dossier };
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue');
      return { success: false, error: err.response?.data?.message || 'Une erreur est survenue' };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateDossierStatus = useCallback(async (id, status) => {
    setLoading(true);
    try {
      const response = await axios.patch(`/api/dossiers/${id}/status`, { status });
      
      // Mettre à jour le dossier dans la liste locale
      setDossiers(prevDossiers => 
        prevDossiers.map(dossier => 
          dossier.id === id ? { ...dossier, status: status, updated_at: new Date().toISOString() } : dossier
        )
      );
      
      return { success: true, data: response.data.dossier };
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue lors de la mise à jour du statut');
      return { success: false, error: err.response?.data?.message || 'Une erreur est survenue lors de la mise à jour du statut' };
    } finally {
      setLoading(false);
    }
  }, []);

  const searchDossiers = useCallback((searchTerm) => {
    if (!searchTerm) return dossiers;
    return dossiers.filter(dossier => 
      dossier.patient?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dossier.patient?.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dossier.numero_dossier?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [dossiers]);

  return {
    dossiers,
    loading,
    error,
    fetchDossiers,
    getDossier,
    updateDossierStatus,
    searchDossiers
  };
};

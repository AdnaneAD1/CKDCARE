import { useState, useCallback } from 'react';
import axios from '@/lib/axios';

export const usePatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/patients/all');
      setPatients(response.data.patients);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }, []);

  const createPatient = useCallback(async (patientData) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/patients', patientData);
      setPatients(prev => [...prev, response.data.patient]);
      setError(null);
      return { success: true, data: response.data.patient };
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue');
      return { 
        success: false, 
        error: err.response?.data?.errors || err.response?.data?.message || 'Une erreur est survenue' 
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const searchPatients = useCallback((searchTerm) => {
    if (!searchTerm) return patients;
    return patients.filter(patient => 
      patient.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.numero_secu?.includes(searchTerm)
    );
  }, [patients]);

  const deletePatient = useCallback(async (patientId) => {
    setLoading(true);
    try {
      await axios.delete(`/api/patients/${patientId}`);
      setPatients(prev => prev.filter(patient => patient.id !== patientId));
      setError(null);
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue lors de la suppression');
      return { 
        success: false, 
        error: err.response?.data?.errors || err.response?.data?.message || 'Une erreur est survenue lors de la suppression' 
      };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    patients,
    loading,
    error,
    fetchPatients,
    createPatient,
    searchPatients,
    deletePatient
  };
};

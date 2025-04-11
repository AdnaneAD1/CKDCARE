'use client';

import { useState } from 'react';
import axios from '@/lib/axios';

export const usePatient = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getPatient = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/patients/${id}`);
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue');
      setLoading(false);
      throw err;
    }
  };

  const updatePatient = async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(`/api/patients/${id}`, data);
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue');
      setLoading(false);
      throw err;
    }
  };

  const getPatientVisites = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/patients/${id}/visites`);
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue');
      setLoading(false);
      throw err;
    }
  };

  const createVisite = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/visites', data);
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue');
      setLoading(false);
      throw err;
    }
  };

  const updateVisite = async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(`/api/visites/${id}`, data);
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue');
      setLoading(false);
      throw err;
    }
  };

  return {
    loading,
    error,
    getPatient,
    updatePatient,
    getPatientVisites,
    createVisite,
    updateVisite
  };
};

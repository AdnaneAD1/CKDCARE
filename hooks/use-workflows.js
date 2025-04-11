import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import axios from '@/lib/axios';

export function useWorkflows() {
  const { toast } = useToast();
  const [workflows, setWorkflows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWorkflows = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/workflows');
      setWorkflows(response.data.workflows);
      setError(null);
    } catch (err) {
      setError('Erreur lors de la récupération des workflows');
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les workflows",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createWorkflow = async (workflowData) => {
    try {
      const response = await axios.post('/api/workflows', workflowData);
      setWorkflows([...workflows, response.data.workflow]);
      toast({
        title: "Succès",
        description: "Le workflow a été créé avec succès"
      });
      return true;
    } catch (err) {
      toast({
        title: "Erreur",
        description: err.response?.data?.message || "Erreur lors de la création du workflow",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateWorkflow = async (id, workflowData) => {
    try {
      const response = await axios.put(`/api/workflows/${id}`, workflowData);
      setWorkflows(workflows.map(w => w.id === id ? response.data.workflow : w));
      toast({
        title: "Succès",
        description: "Le workflow a été mis à jour avec succès"
      });
      return true;
    } catch (err) {
      toast({
        title: "Erreur",
        description: err.response?.data?.message || "Erreur lors de la mise à jour du workflow",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteWorkflow = async (id) => {
    try {
      await axios.delete(`/api/workflows/${id}`);
      setWorkflows(workflows.filter(w => w.id !== id));
      toast({
        title: "Succès",
        description: "Le workflow a été supprimé avec succès"
      });
      return true;
    } catch (err) {
      toast({
        title: "Erreur",
        description: err.response?.data?.message || "Erreur lors de la suppression du workflow",
        variant: "destructive"
      });
      return false;
    }
  };

  const assignToPatient = async (workflowId, patientId) => {
    try {
      await axios.post(`/api/workflows/${workflowId}/assign`, { patient_id: patientId });
      toast({
        title: "Succès",
        description: "Le workflow a été assigné au patient avec succès"
      });
      return true;
    } catch (err) {
      toast({
        title: "Erreur",
        description: err.response?.data?.message || "Erreur lors de l'assignation du workflow",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  return {
    workflows,
    isLoading,
    error,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    assignToPatient,
    refetch: fetchWorkflows
  };
}

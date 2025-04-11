'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, FileText, RefreshCw } from 'lucide-react';
import { useDossiers } from '@/hooks/use-dossiers';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function DossiersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = searchParams.get('patient');
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const { dossiers, loading, error, fetchDossiers, searchDossiers, updateDossierStatus } = useDossiers(patientId);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  useEffect(() => {
    fetchDossiers();
  }, [fetchDossiers]);

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const filteredDossiers = searchDossiers(searchTerm);

  const handleConsult = (dossierId) => {
    router.push(`/dossiers/${dossierId}`);
  };

  const handleUpdateStatus = async (dossierId, newStatus) => {
    setUpdatingStatus(dossierId);
    try {
      const result = await updateDossierStatus(dossierId, newStatus);
      if (result.success) {
        toast({
          title: "Statut mis à jour",
          description: `Le statut du dossier a été changé en ${newStatus === 'urgent' ? 'Urgent' : newStatus === 'en_cours' ? 'En cours' : 'Stable'}`
        });
      } else {
        toast({
          title: "Erreur",
          description: result.error,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour du statut",
        variant: "destructive"
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: fr });
    } catch {
      return 'Date invalide';
    }
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dossiers Médicaux</h1>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un dossier..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Dossiers</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Date de Création</TableHead>
                <TableHead>Dernière Mise à Jour</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Chargement des dossiers...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-destructive">
                    {error}
                  </TableCell>
                </TableRow>
              ) : filteredDossiers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Aucun dossier trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredDossiers.map((dossier) => (
                  <TableRow key={dossier.id}>
                    <TableCell>{`${dossier.patient?.nom || ''} ${dossier.patient?.prenom || ''}`}</TableCell>
                    <TableCell>{formatDate(dossier.created_at)}</TableCell>
                    <TableCell>{formatDate(dossier.updated_at)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-sm ${dossier.status === 'urgent' ? 'bg-red-100 text-red-800' :
                        dossier.status === 'en_cours' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'}`}>
                        {dossier.status === 'urgent' ? 'Urgent' :
                         dossier.status === 'en_cours' ? 'En cours' :
                         'Stable'}
                      </span>
                    </TableCell>
                    <TableCell className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleConsult(dossier.id)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Consulter
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            disabled={updatingStatus === dossier.id}
                          >
                            {updatingStatus === dossier.id ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Mise à jour...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Statut
                              </>
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => handleUpdateStatus(dossier.id, 'stable')}
                            className="text-green-600"
                            disabled={dossier.status === 'stable'}
                          >
                            Stable
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleUpdateStatus(dossier.id, 'en_cours')}
                            className="text-blue-600"
                            disabled={dossier.status === 'en_cours'}
                          >
                            En cours
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleUpdateStatus(dossier.id, 'urgent')}
                            className="text-red-600"
                            disabled={dossier.status === 'urgent'}
                          >
                            Urgent
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
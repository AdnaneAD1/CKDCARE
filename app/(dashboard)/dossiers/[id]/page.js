'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Activity, Calendar, Pill as Pills, AlertCircle, Stethoscope, FlaskRound, ClipboardList, Edit2, X, Check, FileText as Report, UserCog } from 'lucide-react';
import { format, parseISO, differenceInYears } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { useDeviceType } from '@/hooks/use-device-type';
import { useSwipeable } from 'react-swipeable';
import { usePatient } from '@/hooks/use-patient';

export default function DossierDetails() {
  const params = useParams();
  const [patient, setPatient] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editPatientDialogOpen, setEditPatientDialogOpen] = useState(false);
  const { toast } = useToast();
  const deviceType = useDeviceType();
  const isMobile = deviceType === 'mobile';
  const [activeTab, setActiveTab] = useState('visites');
  const [selectedVisit, setSelectedVisit] = useState(null);
  const { getPatient, updatePatient, getPatientVisites, createVisite, updateVisite, loading, error } = usePatient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUpdatingPatient, setIsUpdatingPatient] = useState(false);
  const [patientData, setPatientData] = useState({
    nom: '',
    prenom: '',
    date_naissance: '',
    sexe: '',
    adresse: '',
    telephone: '',
    email: '',
    numero_secu: '',
    stade: '',
    medecinReferent: ''
  });

  const [nouvelleVisite, setNouvelleVisite] = useState({
    date: new Date().toISOString().split('T')[0],
    heure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    medecin: '',
    motif: '',
    status: 'planifié',
    examens: [],
    biologie: [],
    prescriptions: [],
    notes: ''
  });

  const [nouvelExamen, setNouvelExamen] = useState({ type: '', resultat: '' });
  const [nouvelleBiologie, setNouvelleBiologie] = useState({ type: '', resultat: '' });
  const [nouvellePrescription, setNouvellePrescription] = useState({ medicament: '', posologie: '' });

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      const tabs = ['visites', 'informations', 'antecedents', 'examens', 'prescriptions', 'rapport'];
      const currentIndex = tabs.indexOf(activeTab);
      if (currentIndex < tabs.length - 1) {
        setActiveTab(tabs[currentIndex + 1]);
      }
    },
    onSwipedRight: () => {
      const tabs = ['visites', 'informations', 'antecedents', 'examens', 'prescriptions', 'rapport'];
      const currentIndex = tabs.indexOf(activeTab);
      if (currentIndex > 0) {
        setActiveTab(tabs[currentIndex - 1]);
      }
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: false
  });

  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy', { locale: fr });
    } catch (error) {
      return dateString;
    }
  };

  const calculateAge = (dateString) => {
    try {
      const birthDate = parseISO(dateString);
      return differenceInYears(new Date(), birthDate);
    } catch (error) {
      return 'N/A';
    }
  };

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const patientData = await getPatient(params.id);
        const visitesData = await getPatientVisites(params.id);
        
        // Format dates in visites
        const formattedVisites = visitesData.map(visite => ({
          ...visite,
          date: formatDate(visite.date)
        }));

        setPatient({
          ...patientData,
          dateNaissance: formatDate(patientData.date_naissance),
          age: calculateAge(patientData.date_naissance),
          visites: formattedVisites
        });

        // Initialiser les données du formulaire de mise à jour
        setPatientData({
          nom: patientData.nom || '',
          prenom: patientData.prenom || '',
          date_naissance: patientData.date_naissance ? patientData.date_naissance.split('T')[0] : '',
          sexe: patientData.sexe || '',
          adresse: patientData.adresse || '',
          telephone: patientData.telephone || '',
          email: patientData.email || '',
          numero_secu: patientData.numero_secu || '',
          stade: patientData.stade || '',
          medecinReferent: patientData.medecinReferent || ''
        });
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les données du patient",
          variant: "destructive"
        });
      }
    };

    if (params.id) {
      fetchPatientData();
    }
  }, [params.id]);

  const ajouterExamen = () => {
    if (nouvelExamen.type) {
      setNouvelleVisite({
        ...nouvelleVisite,
        examens: [...nouvelleVisite.examens, { 
          type: nouvelExamen.type, 
          resultat: nouvelExamen.resultat || "en attente" 
        }]
      });
      setNouvelExamen({ type: '', resultat: '' });
    }
  };

  const ajouterBiologie = () => {
    if (nouvelleBiologie.type) {
      setNouvelleVisite({
        ...nouvelleVisite,
        biologie: [...nouvelleVisite.biologie, { 
          type: nouvelleBiologie.type, 
          resultat: nouvelleBiologie.resultat || "en attente" 
        }]
      });
      setNouvelleBiologie({ type: '', resultat: '' });
    }
  };

  const ajouterPrescription = () => {
    if (!nouvellePrescription.medicament || !nouvellePrescription.posologie) {
      toast({
        title: "Erreur",
        description: "Le médicament et la posologie sont obligatoires pour ajouter une prescription",
        variant: "destructive"
      });
      return;
    }

    setNouvelleVisite({
      ...nouvelleVisite,
      prescriptions: [...nouvelleVisite.prescriptions, { 
        medicament: nouvellePrescription.medicament, 
        posologie: nouvellePrescription.posologie
      }]
    });
    setNouvellePrescription({ medicament: '', posologie: '' });
  };

  const enregistrerVisite = async () => {
    if (!nouvelleVisite.medecin || !nouvelleVisite.motif) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir au moins le médecin et le motif de la visite",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const visiteData = {
        ...nouvelleVisite,
        patient_id: params.id,
      };

      await createVisite(visiteData);
      
      // Rafraîchir les données du patient
      const patientData = await getPatient(params.id);
      const visitesData = await getPatientVisites(params.id);
      setPatient({
        ...patientData,
        visites: visitesData.map(visite => ({
          ...visite,
          date: formatDate(visite.date)
        }))
      });

      setDialogOpen(false);
      setNouvelleVisite({
        date: new Date().toISOString().split('T')[0],
        heure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        medecin: '',
        motif: '',
        status: 'planifié',
        examens: [],
        biologie: [],
        prescriptions: [],
        notes: ''
      });

      toast({
        title: "Visite enregistrée",
        description: "La nouvelle visite a été ajoutée au dossier"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Erreur lors de l'enregistrement de la visite",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditVisit = (visite) => {
    setSelectedVisit(visite);
    setNouvelleVisite(visite);
    setEditDialogOpen(true);
  };

  const handleUpdateVisit = async () => {
    setIsUpdating(true);
    
    try {
      await updateVisite(selectedVisit.id, nouvelleVisite);
      
      // Rafraîchir les données du patient
      const patientData = await getPatient(params.id);
      const visitesData = await getPatientVisites(params.id);
      setPatient({
        ...patientData,
        visites: visitesData.map(visite => ({
          ...visite,
          date: formatDate(visite.date)
        }))
      });
      
      setEditDialogOpen(false);
      setSelectedVisit(null);
      setNouvelleVisite({
        date: new Date().toISOString().split('T')[0],
        heure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        medecin: '',
        motif: '',
        status: 'planifié',
        examens: [],
        biologie: [],
        prescriptions: [],
        notes: ''
      });

      toast({
        title: "Visite mise à jour",
        description: "Les modifications ont été enregistrées"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Erreur lors de la mise à jour de la visite",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelVisit = async (visiteId) => {
    setIsCancelling(true);
    
    try {
      await updateVisite(visiteId, { status: 'annulé' });
      
      // Rafraîchir les données du patient
      const patientData = await getPatient(params.id);
      const visitesData = await getPatientVisites(params.id);
      setPatient({
        ...patientData,
        visites: visitesData.map(visite => ({
          ...visite,
          date: formatDate(visite.date)
        }))
      });

      toast({
        title: "Visite annulée",
        description: "La visite a été marquée comme annulée"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Erreur lors de l'annulation de la visite",
        variant: "destructive"
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'planifié':
        return 'text-blue-500 bg-blue-50';
      case 'terminé':
        return 'text-green-500 bg-green-50';
      case 'annulé':
        return 'text-red-500 bg-red-50';
      default:
        return 'text-gray-500 bg-gray-50';
    }
  };

  const generateMedicalReport = () => {
    // Récupérer la dernière et l'avant-dernière visite
    const lastVisit = patient.visites[0];
    const previousVisit = patient.visites[1];
    const isLastVisitCancelled = lastVisit?.status === 'annulé';
    const isPreviousVisitCancelled = previousVisit?.status === 'annulé';
    
    // Récupérer les derniers examens biologiques
    const lastBiologie = !isLastVisitCancelled ? (lastVisit?.biologie || []) : [];
    const previousBiologie = !isPreviousVisitCancelled ? (previousVisit?.biologie || []) : [];
    
    // Calculer l'âge
    const birthDate = new Date(patient.dateNaissance);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();

    const formatVisitData = (visit, isCancelled) => {
      if (!visit) return null;
      return {
        date: `${visit.date}${isCancelled ? ' (annulée)' : ''}`,
        heure: visit.heure,
        examens: visit.examens || [],
        biologie: visit.biologie || [],
        conclusion: isCancelled ? 'Visite annulée' : (visit.notes || 'Pas de conclusion spécifiée')
      };
    };
    
    // Générer le texte du rapport
    return {
      resume: `Patient(e) ${patient.prenom} ${patient.nom}, âgé(e) de ${age} ans, suivi(e) pour une maladie rénale chronique stade ${patient.stade}.`,
      numeroDossier: `Dossier ${patient.dossier.numero_dossier}`,
      antecedents: patient.antecedents.map(ant => `- ${ant.details}`).join('\n'),
      traitements: patient.traitements.map(trait => `- ${trait.details} (${trait.posologie})`).join('\n'),
      dernierControle: formatVisitData(lastVisit, isLastVisitCancelled),
      avantDernierControle: formatVisitData(previousVisit, isPreviousVisitCancelled),
      evolution: isLastVisitCancelled ? 
        'Dernière visite annulée' : 
        `L'évolution est ${lastVisit?.notes?.includes('amélioration') ? 'favorable' : 'stable'}.`,
      recommendations: isLastVisitCancelled ? 
        'Une nouvelle visite devrait être planifiée.' : 
        'Maintien du traitement actuel. Surveillance régulière de la fonction rénale. Régime alimentaire adapté.'
    };
  };

  // Fonction pour filtrer les visites non annulées
  const getActiveVisites = () => {
    return patient?.visites?.filter(v => v.status !== 'annulé') || [];
  };

  // Fonction pour obtenir tous les examens des visites actives
  const getAllExamens = () => {
    const activeVisites = getActiveVisites();
    return activeVisites.reduce((acc, visite) => {
      return acc.concat(visite.examens || []);
    }, []);
  };

  // Fonction pour obtenir toutes les prescriptions des visites actives
  const getAllPrescriptions = () => {
    const activeVisites = getActiveVisites();
    return activeVisites.reduce((acc, visite) => {
      return acc.concat(visite.prescriptions || []);
    }, []);
  };

  // Fonction pour obtenir tous les examens biologiques des visites actives
  const getAllBiologie = () => {
    const activeVisites = getActiveVisites();
    return activeVisites.reduce((acc, visite) => {
      return acc.concat(visite.biologie || []);
    }, []);
  };

  const handleUpdatePatient = async () => {
    if (!patientData.nom || !patientData.prenom || !patientData.date_naissance) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    setIsUpdatingPatient(true);
    
    try {
      await updatePatient(params.id, patientData);
      
      // Rafraîchir les données du patient
      const updatedPatientData = await getPatient(params.id);
      const visitesData = await getPatientVisites(params.id);
      
      setPatient({
        ...updatedPatientData,
        dateNaissance: formatDate(updatedPatientData.date_naissance),
        age: calculateAge(updatedPatientData.date_naissance),
        visites: visitesData.map(visite => ({
          ...visite,
          date: formatDate(visite.date)
        }))
      });
      
      setEditPatientDialogOpen(false);

      toast({
        title: "Patient mis à jour",
        description: "Les informations du patient ont été mises à jour avec succès"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Erreur lors de la mise à jour du patient",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingPatient(false);
    }
  };

  if (!patient) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-lg text-gray-500">Chargement du dossier...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className={cn(
        "mb-6",
        isMobile && "space-y-4"
      )}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Dossier de {patient.prenom} {patient.nom}
            </h1>
            <p className="text-muted-foreground">
              N° Sécurité Sociale : {patient.numero_secu}
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className={cn(isMobile && "w-full")}>
                <Stethoscope className="mr-2 h-4 w-4" />
                Nouvelle Visite
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Enregistrer une nouvelle visite</DialogTitle>
                <DialogDescription>
                  Renseignez les informations de la visite
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className={cn(
                  "grid gap-4",
                  isMobile ? "grid-cols-1" : "grid-cols-3"
                )}>
                  <div className="space-y-2">
                    <Label>Date de la visite</Label>
                    <Input
                      type="date"
                      value={nouvelleVisite.date}
                      onChange={(e) => setNouvelleVisite({...nouvelleVisite, date: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Heure de la visite</Label>
                    <Input
                      type="time"
                      value={nouvelleVisite.heure}
                      onChange={(e) => setNouvelleVisite({...nouvelleVisite, heure: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Médecin</Label>
                    <Input
                      value={nouvelleVisite.medecin}
                      onChange={(e) => setNouvelleVisite({...nouvelleVisite, medecin: e.target.value})}
                      placeholder="Nom du médecin"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Motif de la visite</Label>
                  <Input
                    value={nouvelleVisite.motif}
                    onChange={(e) => setNouvelleVisite({...nouvelleVisite, motif: e.target.value})}
                    placeholder="Motif de la consultation"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Examens cliniques</Label>
                  <div className="space-y-2">
                    {nouvelleVisite.examens.map((examen, index) => (
                      <div key={index} className="p-2 bg-secondary rounded flex justify-between items-center">
                        <span>
                          {examen.type}: <span className={cn(
                            examen.resultat === "en attente" && "text-muted-foreground italic"
                          )}>{examen.resultat}</span>
                        </span>
                      </div>
                    ))}
                    <div className={cn(
                      "flex gap-2",
                      isMobile && "flex-col"
                    )}>
                      <Input
                        placeholder="Type d'examen"
                        value={nouvelExamen.type}
                        onChange={(e) => setNouvelExamen({...nouvelExamen, type: e.target.value})}
                      />
                      <Input
                        placeholder="Résultat (optionnel)"
                        value={nouvelExamen.resultat}
                        onChange={(e) => setNouvelExamen({...nouvelExamen, resultat: e.target.value})}
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={ajouterExamen}
                        className={cn(isMobile && "w-full")}
                      >
                        Ajouter
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Examens biologiques</Label>
                  <div className="space-y-2">
                    {nouvelleVisite.biologie.map((bio, index) => (
                      <div key={index} className="p-2 bg-secondary rounded flex justify-between items-center">
                        <span>
                          {bio.type}: <span className={cn(
                            bio.resultat === "en attente" && "text-muted-foreground italic"
                          )}>{bio.resultat}</span>
                        </span>
                      </div>
                    ))}
                    <div className={cn(
                      "flex gap-2",
                      isMobile && "flex-col"
                    )}>
                      <Input
                        placeholder="Type d'analyse"
                        value={nouvelleBiologie.type}
                        onChange={(e) => setNouvelleBiologie({...nouvelleBiologie, type: e.target.value})}
                      />
                      <Input
                        placeholder="Résultat (optionnel)"
                        value={nouvelleBiologie.resultat}
                        onChange={(e) => setNouvelleBiologie({...nouvelleBiologie, resultat: e.target.value})}
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={ajouterBiologie}
                        className={cn(isMobile && "w-full")}
                      >
                        Ajouter
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Prescriptions</Label>
                  <div className="space-y-2">
                    {nouvelleVisite.prescriptions.map((prescription, index) => (
                      <div key={index} className="p-2 bg-secondary rounded flex justify-between items-center">
                        <span>
                          {prescription.medicament} - {prescription.posologie}
                        </span>
                      </div>
                    ))}
                    <div className={cn(
                      "flex gap-2",
                      isMobile && "flex-col"
                    )}>
                      <Input
                        placeholder="Médicament"
                        value={nouvellePrescription.medicament}
                        onChange={(e) => setNouvellePrescription({...nouvellePrescription, medicament: e.target.value})}
                      />
                      <Input
                        placeholder="Posologie"
                        value={nouvellePrescription.posologie}
                        onChange={(e) => setNouvellePrescription({...nouvellePrescription, posologie: e.target.value})}
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={ajouterPrescription}
                        className={cn(isMobile && "w-full")}
                      >
                        Ajouter
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={nouvelleVisite.notes}
                    onChange={(e) => setNouvelleVisite({...nouvelleVisite, notes: e.target.value})}
                    placeholder="Observations et remarques"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Statut de la visite</Label>
                  <Select
                    value={nouvelleVisite.status}
                    onValueChange={(value) => setNouvelleVisite({...nouvelleVisite, status: value})}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionner un statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planifié">Planifié</SelectItem>
                      <SelectItem value="terminé">Terminé</SelectItem>
                      <SelectItem value="annulé">Annulé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={enregistrerVisite}
                  className={cn(isMobile && "w-full")}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" fill="currentColor" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S16.627 6 12 6z" />
                      </svg>
                      Enregistrement en cours...
                    </div>
                  ) : (
                    "Enregistrer la visite"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className={cn(
          "grid gap-4",
          isMobile ? "grid-cols-1" : "md:grid-cols-3"
        )}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Stade MRC</p>
                  <p className="text-2xl font-bold">{patient.stade}</p>
                </div>
                <Activity className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Dernier RDV</p>
                  <p className="text-2xl font-bold">{patient.visites[patient.visites.length - 1]?.date || 'Aucun'}</p>
                </div>
                <Calendar className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Traitements actifs</p>
                  <p className="text-2xl font-bold">{patient.traitements.length}</p>
                </div>
                <Pills className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="space-y-4"
        {...swipeHandlers}
      >
        <TabsList className={cn(
          "w-full justify-start",
          isMobile && "overflow-x-auto flex-nowrap"
        )}>
          <TabsTrigger value="visites" className="flex items-center">
            <Stethoscope className="h-4 w-4 mr-2" />
            <span className={cn(isMobile && "text-sm")}>Visites</span>
          </TabsTrigger>
          <TabsTrigger value="informations" className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            <span className={cn(isMobile && "text-sm")}>Informations</span>
          </TabsTrigger>
          <TabsTrigger value="antecedents" className="flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            <span className={cn(isMobile && "text-sm")}>Antécédents</span>
          </TabsTrigger>
          <TabsTrigger value="examens" className="flex items-center">
            <FlaskRound className="h-4 w-4 mr-2" />
            <span className={cn(isMobile && "text-sm")}>Examens</span>
          </TabsTrigger>
          <TabsTrigger value="prescriptions" className="flex items-center">
            <ClipboardList className="h-4 w-4 mr-2" />
            <span className={cn(isMobile && "text-sm")}>Prescriptions</span>
          </TabsTrigger>
          <TabsTrigger value="rapport" className="flex items-center">
            <Report className="h-4 w-4 mr-2" />
            <span className={cn(isMobile && "text-sm")}>Rapport Médical</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="visites">
          <Card>
            <CardHeader>
              <CardTitle>Historique des visites</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {patient.visites.map((visite, index) => (
                  <div key={index} className="border-b pb-6 last:border-0">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-lg">
                            {visite.date} à {visite.heure || "heure non spécifiée"}
                          </h3>
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-sm",
                            getStatusColor(visite.status)
                          )}>
                            {visite.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {visite.medecin} - {visite.motif}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {visite.status !== 'annulé' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditVisit(visite)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-destructive"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Annuler la visite</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Êtes-vous sûr de vouloir annuler cette visite ? Cette action ne peut pas être annulée.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleCancelVisit(visite.id)}
                                    disabled={isCancelling}
                                  >
                                    {isCancelling ? (
                                      <div className="flex items-center justify-center">
                                        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" fill="currentColor" />
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S16.627 6 12 6z" />
                                        </svg>
                                        Annulation en cours...
                                      </div>
                                    ) : (
                                      "Confirmer"
                                    )}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                      </div>
                    </div>

                    {visite.examens.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Examens cliniques</h4>
                        <div className={cn(
                          "grid gap-2",
                          isMobile ? "grid-cols-1" : "grid-cols-2"
                        )}>
                          {visite.examens.map((examen, i) => (
                            <div key={i} className="p-2 bg-secondary rounded flex justify-between items-center">
                              <span>
                                {examen.type}: <span className={cn(
                                  examen.resultat === "en attente" && "text-muted-foreground italic"
                                )}>{examen.resultat}</span>
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {visite.biologie.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Examens biologiques</h4>
                        <div className={cn(
                          "grid gap-2",
                          isMobile ? "grid-cols-1" : "grid-cols-2"
                        )}>
                          {visite.biologie.map((bio, i) => (
                            <div key={i} className="p-2 bg-secondary rounded flex justify-between items-center">
                              <span>
                                {bio.type}: <span className={cn(
                                  bio.resultat === "en attente" && "text-muted-foreground italic"
                                )}>{bio.resultat}</span>
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {visite.prescriptions.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Prescriptions</h4>
                        <div className={cn(
                          "grid gap-2",
                          isMobile ? "grid-cols-1" : "grid-cols-2"
                        )}>
                          {visite.prescriptions.map((prescription, i) => (
                            <div key={i} className="p-2 bg-secondary rounded flex justify-between items-center">
                              <span className="font-medium">{prescription.medicament}</span>
                              <p className="text-sm text-muted-foreground">{prescription.posologie}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {visite.notes && (
                      <div>
                        <h4 className="font-medium mb-2">Notes</h4>
                        <p className="text-sm text-muted-foreground">{visite.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Modifier la visite</DialogTitle>
              <DialogDescription>
                Mettez à jour les informations de la visite
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className={cn(
                "grid gap-4",
                isMobile ? "grid-cols-1" : "grid-cols-3"
              )}>
                <div className="space-y-2">
                  <Label>Date de la visite</Label>
                  <Input
                    type="date"
                    value={nouvelleVisite.date}
                    onChange={(e) => setNouvelleVisite({...nouvelleVisite, date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Heure de la visite</Label>
                  <Input
                    type="time"
                    value={nouvelleVisite.heure}
                    onChange={(e) => setNouvelleVisite({...nouvelleVisite, heure: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Médecin</Label>
                  <Input
                    value={nouvelleVisite.medecin}
                    onChange={(e) => setNouvelleVisite({...nouvelleVisite, medecin: e.target.value})}
                    placeholder="Nom du médecin"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Motif de la visite</Label>
                <Input
                  value={nouvelleVisite.motif}
                  onChange={(e) => setNouvelleVisite({...nouvelleVisite, motif: e.target.value})}
                  placeholder="Motif de la consultation"
                />
              </div>

              <div className="space-y-2">
                <Label>Examens cliniques</Label>
                <div className="space-y-2">
                  {nouvelleVisite.examens.map((examen,index) => (
                    <div key={index} className="p-2 bg-secondary rounded flex justify-between items-center">
                      <span>{examen.type}</span>
                      <Input
                        value={examen.resultat}
                        onChange={(e) => {
                          const updatedExamens = [...nouvelleVisite.examens];
                          updatedExamens[index].resultat = e.target.value;
                          setNouvelleVisite({...nouvelleVisite, examens: updatedExamens});
                        }}
                        className="w-40 ml-2"
                        placeholder="Résultat"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Examens biologiques</Label>
                <div className="space-y-2">
                  {nouvelleVisite.biologie.map((bio, index) => (
                    <div key={index} className="p-2 bg-secondary rounded flex justify-between items-center">
                      <span>{bio.type}</span>
                      <Input
                        value={bio.resultat}
                        onChange={(e) => {
                          const updatedBiologie = [...nouvelleVisite.biologie];
                          updatedBiologie[index].resultat = e.target.value;
                          setNouvelleVisite({...nouvelleVisite, biologie: updatedBiologie});
                        }}
                        className="w-40 ml-2"
                        placeholder="Résultat"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Prescriptions</Label>
                <div className="space-y-2">
                  {nouvelleVisite.prescriptions.map((prescription, index) => (
                    <div key={index} className="p-2 bg-secondary rounded flex justify-between items-center">
                      <span>{prescription.medicament}</span>
                      <Input
                        value={prescription.posologie}
                        onChange={(e) => {
                          const updatedPrescriptions = [...nouvelleVisite.prescriptions];
                          updatedPrescriptions[index].posologie = e.target.value;
                          setNouvelleVisite({...nouvelleVisite, prescriptions: updatedPrescriptions});
                        }}
                        className="w-40 ml-2"
                        placeholder="Posologie"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={nouvelleVisite.notes}
                  onChange={(e) => setNouvelleVisite({...nouvelleVisite, notes: e.target.value})}
                  placeholder="Observations et remarques"
                />
              </div>

              <div className="space-y-2">
                <Label>Statut de la visite</Label>
                <Select
                  value={nouvelleVisite.status}
                  onValueChange={(value) => setNouvelleVisite({...nouvelleVisite, status: value})}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planifié">Planifié</SelectItem>
                    <SelectItem value="terminé">Terminé</SelectItem>
                    <SelectItem value="annulé">Annulé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Annuler
                </Button>
                <Button 
                  onClick={handleUpdateVisit}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" fill="currentColor" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S16.627 6 12 6z" />
                      </svg>
                      Mise à jour en cours...
                    </div>
                  ) : (
                    "Mettre à jour"
                  )}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        <TabsContent value="informations">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Informations personnelles</CardTitle>
              <Dialog open={editPatientDialogOpen} onOpenChange={setEditPatientDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <UserCog className="mr-2 h-4 w-4" />
                    Modifier
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Modifier les informations du patient</DialogTitle>
                    <DialogDescription>
                      Mettez à jour les informations personnelles du patient
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className={cn(
                      "grid gap-4",
                      isMobile ? "grid-cols-1" : "grid-cols-2"
                    )}>
                      <div className="space-y-2">
                        <Label htmlFor="nom">Nom</Label>
                        <Input
                          id="nom"
                          value={patientData.nom}
                          onChange={(e) => setPatientData({...patientData, nom: e.target.value})}
                          placeholder="Nom du patient"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="prenom">Prénom</Label>
                        <Input
                          id="prenom"
                          value={patientData.prenom}
                          onChange={(e) => setPatientData({...patientData, prenom: e.target.value})}
                          placeholder="Prénom du patient"
                        />
                      </div>
                    </div>
                    
                    <div className={cn(
                      "grid gap-4",
                      isMobile ? "grid-cols-1" : "grid-cols-2"
                    )}>
                      <div className="space-y-2">
                        <Label htmlFor="date_naissance">Date de naissance</Label>
                        <Input
                          id="date_naissance"
                          type="date"
                          value={patientData.date_naissance}
                          onChange={(e) => setPatientData({...patientData, date_naissance: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sexe">Sexe</Label>
                        <Select
                          value={patientData.sexe}
                          onValueChange={(value) => setPatientData({...patientData, sexe: value})}
                        >
                          <SelectTrigger id="sexe">
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="M">Masculin</SelectItem>
                            <SelectItem value="F">Féminin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="adresse">Adresse</Label>
                      <Textarea
                        id="adresse"
                        value={patientData.adresse}
                        onChange={(e) => setPatientData({...patientData, adresse: e.target.value})}
                        placeholder="Adresse complète"
                      />
                    </div>

                    <div className={cn(
                      "grid gap-4",
                      isMobile ? "grid-cols-1" : "grid-cols-2"
                    )}>
                      <div className="space-y-2">
                        <Label htmlFor="telephone">Téléphone</Label>
                        <Input
                          id="telephone"
                          value={patientData.telephone}
                          onChange={(e) => setPatientData({...patientData, telephone: e.target.value})}
                          placeholder="Numéro de téléphone"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={patientData.email}
                          onChange={(e) => setPatientData({...patientData, email: e.target.value})}
                          placeholder="Adresse email"
                        />
                      </div>
                    </div>

                    <div className={cn(
                      "grid gap-4",
                      isMobile ? "grid-cols-1" : "grid-cols-2"
                    )}>
                      <div className="space-y-2">
                        <Label htmlFor="numero_secu">Numéro de sécurité sociale</Label>
                        <Input
                          id="numero_secu"
                          value={patientData.numero_secu}
                          onChange={(e) => setPatientData({...patientData, numero_secu: e.target.value})}
                          placeholder="N° de sécurité sociale"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="stade">Stade MRC</Label>
                        <Select
                          value={patientData.stade}
                          onValueChange={(value) => setPatientData({...patientData, stade: value})}
                        >
                          <SelectTrigger id="stade">
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Stade 1</SelectItem>
                            <SelectItem value="2">Stade 2</SelectItem>
                            <SelectItem value="3">Stade 3</SelectItem>
                            <SelectItem value="4">Stade 4</SelectItem>
                            <SelectItem value="5">Stade 5</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="medecinReferent">Médecin référent</Label>
                      <Input
                        id="medecinReferent"
                        value={patientData.medecinReferent}
                        onChange={(e) => setPatientData({...patientData, medecinReferent: e.target.value})}
                        placeholder="Nom du médecin référent"
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setEditPatientDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button 
                      onClick={handleUpdatePatient}
                      disabled={isUpdatingPatient}
                    >
                      {isUpdatingPatient ? (
                        <div className="flex items-center justify-center">
                          <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" fill="currentColor" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S16.627 6 12 6z" />
                          </svg>
                          Mise à jour en cours...
                        </div>
                      ) : (
                        "Mettre à jour"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className={cn(
              "grid gap-4",
              isMobile ? "grid-cols-1" : "grid-cols-2"
            )}>
              <div>
                <p className="text-sm text-muted-foreground">Date de naissance</p>
                <p className="font-medium">{formatDate(patient.dateNaissance)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sexe</p>
                <p className="font-medium">{patient.sexe === 'F' ? 'Féminin' : 'Masculin'}</p>
              </div>
              <div className={cn(isMobile && "col-span-full")}>
                <p className="text-sm text-muted-foreground">Adresse</p>
                <p className="font-medium">{patient.adresse}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Téléphone</p>
                <p className="font-medium">{patient.telephone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{patient.email || 'Non renseigné'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Médecin référent</p>
                <p className="font-medium">{patient.medecinReferent || 'Non défini'}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="antecedents">
          <Card>
            <CardHeader>
              <CardTitle>Antécédents médicaux</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patient.antecedents.map((antecedent, index) => (
                  <div key={index} className="p-4 bg-secondary rounded-lg">
                    <p className="font-medium text-primary">
                      {antecedent.categorie.split('_').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </p>
                    <p className="mt-1">{antecedent.details}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examens">
          <Card>
            <CardHeader>
              <CardTitle>Historique des examens</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {getActiveVisites().map((visite, index) => (
                  <div key={index} className="border-b pb-4 last:border-0">
                    <h3 className="font-medium mb-3">{visite.date}</h3>
                    
                    {visite.examens.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Examens cliniques</h4>
                        <div className={cn(
                          "grid gap-2",
                          isMobile ? "grid-cols-1" : "grid-cols-2"
                        )}>
                          {visite.examens.map((examen, i) => (
                            <div key={i} className="p-2 bg-secondary rounded">
                              <span className="font-medium">{examen.type}:</span>{' '}
                              <span className={cn(
                                examen.resultat === "en attente" && "text-muted-foreground italic"
                              )}>{examen.resultat}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {visite.biologie.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Examens biologiques</h4>
                        <div className={cn(
                          "grid gap-2",
                          isMobile ? "grid-cols-1" : "grid-cols-2"
                        )}>
                          {visite.biologie.map((bio, i) => (
                            <div key={i} className="p-2 bg-secondary rounded">
                              <span className="font-medium">{bio.type}:</span>{' '}
                              <span className={cn(
                                bio.resultat === "en attente" && "text-muted-foreground italic"
                              )}>{bio.resultat}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prescriptions">
          <Card>
            <CardHeader>
              <CardTitle>Historique des prescriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {getActiveVisites().map((visite, index) => (
                  <div key={index} className="border-b pb-4 last:border-0">
                    <h3 className="font-medium mb-3">{visite.date}</h3>
                    
                    {visite.prescriptions.length > 0 ? (
                      <div className={cn(
                        "grid gap-2",
                        isMobile ? "grid-cols-1" : "grid-cols-2"
                      )}>
                        {visite.prescriptions.map((prescription, i) => (
                          <div key={i} className="p-2 bg-secondary rounded">
                            <span className="font-medium">{prescription.medicament}</span>
                            <p className="text-sm text-muted-foreground">{prescription.posologie}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Aucune prescription</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rapport">
          <Card>
            <CardHeader className="border-b">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl font-bold">Rapport Médical</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Généré le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}
                  </p>
                </div>
                <Button>
                  <FileText className="mr-2 h-4 w-4" />
                  Télécharger le Rapport
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {(() => {
                const report = generateMedicalReport();
                return (
                  <div className="space-y-8 max-w-4xl mx-auto">
                    <div className="bg-primary/5 rounded-lg p-6 border">
                      <h3 className="text-xl font-bold text-primary mb-3">Résumé du Patient</h3>
                      <p className="text-lg leading-relaxed">{report.numeroDossier} <br /> {report.resume}</p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-4">
                        <div className="bg-secondary/40 rounded-lg p-6">
                          <h3 className="text-lg font-semibold flex items-center mb-4">
                            <AlertCircle className="h-5 w-5 mr-2 text-primary" />
                            Antécédents Médicaux
                          </h3>
                          <div className="space-y-2">
                            {report.antecedents.split('\n').map((antecedent, index) => (
                              <div key={index} className="flex items-start">
                                <span className="h-2 w-2 rounded-full bg-primary mt-2 mr-2" />
                                <p className="text-muted-foreground">{antecedent.substring(2)}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="bg-secondary/40 rounded-lg p-6">
                          <h3 className="text-lg font-semibold flex items-center mb-4">
                            <Pills className="h-5 w-5 mr-2 text-primary" />
                            Traitement Actuel
                          </h3>
                          <div className="space-y-2">
                            {report.traitements.split('\n').map((traitement, index) => (
                              <div key={index} className="flex items-start">
                                <span className="h-2 w-2 rounded-full bg-primary mt-2 mr-2" />
                                <p className="text-muted-foreground">{traitement.substring(2)}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {report.dernierControle && (
                      <div className="bg-card rounded-lg border shadow-sm">
                        <div className="border-b bg-muted/50 px-6 py-4">
                          <h3 className="text-lg font-semibold flex items-center">
                            <Calendar className="h-5 w-5 mr-2 text-primary" />
                            Dernier Contrôle
                            <span className="ml-2 text-sm text-muted-foreground">
                              ({report.dernierControle.date} à {report.dernierControle.heure || "heure non spécifiée"})
                            </span>
                          </h3>
                        </div>
                        <div className="p-6 space-y-6">
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                              Examens Cliniques
                            </h4>
                            <div className="grid gap-3 md:grid-cols-2">
                              {report.dernierControle.examens.map((examen, index) => (
                                <div key={index} 
                                  className="flex items-center p-3 bg-secondary/50 rounded-lg hover:bg-secondary/70 transition-colors">
                                  <div className="flex-1">
                                    <p className="font-medium">{examen.type}</p>
                                    <p className="text-sm text-muted-foreground">{examen.resultat}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                              Examens Biologiques
                            </h4>
                            <div className="grid gap-3 md:grid-cols-2">
                              {report.dernierControle.biologie.map((bio, index) => (
                                <div key={index} 
                                  className="flex items-center p-3 bg-secondary/50 rounded-lg hover:bg-secondary/70 transition-colors">
                                  <div className="flex-1">
                                    <p className="font-medium">{bio.type}</p>
                                    <p className="text-sm text-muted-foreground">{bio.resultat}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="bg-muted/30 rounded-lg p-4">
                            <h4 className="font-medium mb-2">Conclusion</h4>
                            <p className="text-muted-foreground italic">
                              "{report.dernierControle.conclusion}"
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {report.avantDernierControle && (
                      <div className="bg-card rounded-lg border shadow-sm mt-6">
                        <div className="border-b bg-muted/50 px-6 py-4">
                          <h3 className="text-lg font-semibold flex items-center">
                            <Calendar className="h-5 w-5 mr-2 text-primary" />
                            Avant-Dernier Contrôle
                            <span className="ml-2 text-sm text-muted-foreground">
                              ({report.avantDernierControle.date} à {report.avantDernierControle.heure || "heure non spécifiée"})
                            </span>
                          </h3>
                        </div>
                        <div className="p-6 space-y-6">
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                              Examens Cliniques
                            </h4>
                            <div className="grid gap-3 md:grid-cols-2">
                              {report.avantDernierControle.examens.map((examen, index) => (
                                <div key={index} 
                                  className="flex items-center p-3 bg-secondary/50 rounded-lg hover:bg-secondary/70 transition-colors">
                                  <div className="flex-1">
                                    <p className="font-medium">{examen.type}</p>
                                    <p className="text-sm text-muted-foreground">{examen.resultat}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                              Examens Biologiques
                            </h4>
                            <div className="grid gap-3 md:grid-cols-2">
                              {report.avantDernierControle.biologie.map((bio, index) => (
                                <div key={index} 
                                  className="flex items-center p-3 bg-secondary/50 rounded-lg hover:bg-secondary/70 transition-colors">
                                  <div className="flex-1">
                                    <p className="font-medium">{bio.type}</p>
                                    <p className="text-sm text-muted-foreground">{bio.resultat}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="bg-muted/30 rounded-lg p-4">
                            <h4 className="font-medium mb-2">Conclusion</h4>
                            <p className="text-muted-foreground italic">
                              "{report.avantDernierControle.conclusion}"
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="bg-secondary/40 rounded-lg p-6">
                        <h3 className="text-lg font-semibold flex items-center mb-4">
                          <Activity className="h-5 w-5 mr-2 text-primary" />
                          Évolution
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">{report.evolution}</p>
                      </div>

                      <div className="bg-secondary/40 rounded-lg p-6">
                        <h3 className="text-lg font-semibold flex items-center mb-4">
                          <ClipboardList className="h-5 w-5 mr-2 text-primary" />
                          Recommandations
                        </h3>
                        <div className="space-y-2">
                          {report.recommendations.split('. ').map((recommendation, index) => (
                            <div key={index} className="flex items-start">
                              <Check className="h-4 w-4 mr-2 mt-1 text-primary" />
                              <p className="text-muted-foreground">{recommendation}.</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
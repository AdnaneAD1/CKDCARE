'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, UserPlus, Plus, X, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import { usePatients } from '@/hooks/use-patients';

const ANTECEDENT_CATEGORIES = {
  maladies_chroniques: "Maladies chroniques",
  allergies: "Allergies",
  chirurgies: "Chirurgies",
  hospitalisations: "Hospitalisations",
  traitements_passes: "Traitements passés",
  antecedents_familiaux: "Antécédents familiaux",
  vaccinations: "Vaccinations"
};

const TREATMENT_CATEGORIES = {
  medicaments: "Médicaments",
  therapies: "Thérapies",
  dispositifs_medicaux: "Dispositifs médicaux",
  reeducation: "Rééducation",
  dialyse: "Dialyse",
  nutrition: "Nutrition",
  autres: "Autres traitements"
};

export default function PatientsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const { patients, loading, error, fetchPatients, createPatient, searchPatients, deletePatient } = usePatients();
  const [newPatient, setNewPatient] = useState({
    nom: '',
    prenom: '',
    date_naissance: '',
    sexe: '',
    adresse: '',
    telephone: '',
    email: '',
    numero_secu: '',
    medecin_referent: '',
    stade: '',
    antecedents: [],
    traitements: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [nouvelAntecedent, setNouvelAntecedent] = useState({
    categorie: '',
    details: ''
  });
  const [nouveauTraitement, setNouveauTraitement] = useState({
    categorie: '',
    details: '',
    posologie: ''
  });

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const filteredPatients = searchPatients(searchTerm);

  const handleNewPatient = async () => {
    if (!newPatient.nom || !newPatient.prenom || !newPatient.date_naissance || !newPatient.numero_secu) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await createPatient(newPatient);
      
      if (result.success) {
        setNewPatient({
          nom: '',
          prenom: '',
          date_naissance: '',
          sexe: '',
          adresse: '',
          telephone: '',
          email: '',
          numero_secu: '',
          medecin_referent: '',
          stade: '',
          antecedents: [],
          traitements: []
        });
        setDialogOpen(false);
        toast({
          title: "Patient ajouté",
          description: "Le nouveau patient a été enregistré avec succès"
        });
      } else {
        toast({
          title: "Erreur",
          description: typeof result.error === 'object' 
            ? Object.values(result.error).flat().join(', ')
            : result.error,
          variant: "destructive"
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDossier = (patientId) => {
    router.push(`/dossiers?patient=${patientId}`);
  };

  const handleDeletePatient = async (patientId, patientName) => {
    setIsDeleting(true);
    try {
      const result = await deletePatient(patientId);
      
      if (result.success) {
        toast({
          title: "Patient supprimé",
          description: `Le patient ${patientName} a été supprimé avec succès`
        });
      } else {
        toast({
          title: "Erreur",
          description: typeof result.error === 'object' 
            ? Object.values(result.error).flat().join(', ')
            : result.error,
          variant: "destructive"
        });
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const ajouterAntecedent = () => {
    if (!nouvelAntecedent.categorie || !nouvelAntecedent.details) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une catégorie et saisir les détails",
        variant: "destructive"
      });
      return;
    }

    setNewPatient({
      ...newPatient,
      antecedents: [...newPatient.antecedents, { ...nouvelAntecedent }]
    });
    setNouvelAntecedent({ categorie: '', details: '' });
  };

  const supprimerAntecedent = (index) => {
    const nouveauxAntecedents = newPatient.antecedents.filter((_, i) => i !== index);
    setNewPatient({
      ...newPatient,
      antecedents: nouveauxAntecedents
    });
  };

  const ajouterTraitement = () => {
    if (!nouveauTraitement.categorie || !nouveauTraitement.details || !nouveauTraitement.posologie) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs du traitement",
        variant: "destructive"
      });
      return;
    }

    setNewPatient({
      ...newPatient,
      traitements: [...newPatient.traitements, { ...nouveauTraitement }]
    });
    setNouveauTraitement({ categorie: '', details: '', posologie: '' });
  };

  const supprimerTraitement = (index) => {
    const nouveauxTraitements = newPatient.traitements.filter((_, i) => i !== index);
    setNewPatient({
      ...newPatient,
      traitements: nouveauxTraitements
    });
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des Patients</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Nouveau Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="sticky top-0 bg-background pt-6 pb-4 z-10">
              <DialogTitle>Ajouter un nouveau patient</DialogTitle>
              <DialogDescription>
                Remplissez les informations du patient
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4 px-1">
              <div className="space-y-2">
                <Label htmlFor="nom" className="font-medium">Nom*</Label>
                <Input
                  id="nom"
                  value={newPatient.nom}
                  onChange={(e) => setNewPatient({...newPatient, nom: e.target.value})}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prenom" className="font-medium">Prénom*</Label>
                <Input
                  id="prenom"
                  value={newPatient.prenom}
                  onChange={(e) => setNewPatient({...newPatient, prenom: e.target.value})}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_naissance" className="font-medium">Date de naissance*</Label>
                <Input
                  id="date_naissance"
                  type="date"
                  value={newPatient.date_naissance}
                  onChange={(e) => setNewPatient({...newPatient, date_naissance: e.target.value})}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sexe" className="font-medium">Sexe*</Label>
                <Select
                  id="sexe"
                  value={newPatient.sexe}
                  onValueChange={(value) => setNewPatient({...newPatient, sexe: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Masculin</SelectItem>
                    <SelectItem value="F">Féminin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="adresse" className="font-medium">Adresse</Label>
                <Input
                  id="adresse"
                  value={newPatient.adresse}
                  onChange={(e) => setNewPatient({...newPatient, adresse: e.target.value})}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telephone" className="font-medium">Téléphone</Label>
                <Input
                  id="telephone"
                  type="tel"
                  value={newPatient.telephone}
                  onChange={(e) => setNewPatient({...newPatient, telephone: e.target.value})}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newPatient.email}
                  onChange={(e) => setNewPatient({...newPatient, email: e.target.value})}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numero_secu" className="font-medium">Numéro de Sécurité Sociale*</Label>
                <Input
                  id="numero_secu"
                  value={newPatient.numero_secu}
                  onChange={(e) => setNewPatient({...newPatient, numero_secu: e.target.value})}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="medecin_referent" className="font-medium">Médecin Référent</Label>
                <Input
                  id="medecin_referent"
                  value={newPatient.medecin_referent}
                  onChange={(e) => setNewPatient({...newPatient, medecin_referent: e.target.value})}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stade" className="font-medium">Stade MRC*</Label>
                <Input
                  id="stade"
                  type="number"
                  min="1"
                  max="5"
                  value={newPatient.stade}
                  onChange={(e) => setNewPatient({...newPatient, stade: e.target.value})}
                  className="w-full"
                />
              </div>
              <div className="space-y-4 col-span-2">
                <Label className="font-medium">Antécédents Médicaux</Label>
                <div className="space-y-4">
                  {newPatient.antecedents.map((antecedent, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-secondary rounded-md">
                      <div className="flex-1">
                        <p className="font-medium">{ANTECEDENT_CATEGORIES[antecedent.categorie]}</p>
                        <p className="text-sm text-gray-400">{antecedent.details}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => supprimerAntecedent(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Select
                        value={nouvelAntecedent.categorie}
                        onValueChange={(value) => setNouvelAntecedent({...nouvelAntecedent, categorie: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une catégorie" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(ANTECEDENT_CATEGORIES).map(([key, value]) => (
                            <SelectItem key={key} value={key}>{value}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Détails"
                        value={nouvelAntecedent.details}
                        onChange={(e) => setNouvelAntecedent({...nouvelAntecedent, details: e.target.value})}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={ajouterAntecedent}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4 col-span-2">
                <Label className="font-medium">Traitements en cours</Label>
                <div className="space-y-4">
                  {newPatient.traitements.map((traitement, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-secondary rounded-md">
                      <div className="flex-1">
                        <p className="font-medium">{TREATMENT_CATEGORIES[traitement.categorie]}</p>
                        <p className="text-sm text-gray-400">
                          {traitement.details}
                          <span className="ml-2 text-blue-600">({traitement.posologie})</span>
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => supprimerTraitement(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Select
                        value={nouveauTraitement.categorie}
                        onValueChange={(value) => setNouveauTraitement({...nouveauTraitement, categorie: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une catégorie" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(TREATMENT_CATEGORIES).map(([key, value]) => (
                            <SelectItem key={key} value={key}>{value}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Input
                      placeholder="Nom du traitement"
                      value={nouveauTraitement.details}
                      onChange={(e) => setNouveauTraitement({...nouveauTraitement, details: e.target.value})}
                    />
                    <div className="flex gap-2">
                      <Input
                        placeholder="Posologie"
                        value={nouveauTraitement.posologie}
                        onChange={(e) => setNouveauTraitement({...nouveauTraitement, posologie: e.target.value})}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={ajouterTraitement}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-span-2 sticky bottom-0 bg-background pt-4 pb-6">
                <p className="text-sm text-muted-foreground mb-4">* Champs obligatoires</p>
                <Button className="w-full" onClick={handleNewPatient} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></span>
                      Enregistrement en cours...
                    </>
                  ) : (
                    "Ajouter le patient"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Liste des Patients</CardTitle>
            <div className="flex space-x-2">
              <div className="flex w-full max-w-sm items-center space-x-2">
                <Input
                  placeholder="Rechercher un patient..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Prénom</TableHead>
                    <TableHead>Date de naissance</TableHead>
                    <TableHead>N° Sécurité Sociale</TableHead>
                    <TableHead>Stade</TableHead>
                    <TableHead>Dernier RDV</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        Chargement des patients...
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-destructive">
                        {error}
                      </TableCell>
                    </TableRow>
                  ) : filteredPatients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        Aucun patient trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPatients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell>{patient.nom}</TableCell>
                        <TableCell>{patient.prenom}</TableCell>
                        <TableCell>{new Date(patient.date_naissance).toLocaleDateString('fr-FR')}</TableCell>
                        <TableCell>{patient.numero_secu}</TableCell>
                        <TableCell>{patient.stade || 'Non défini'}</TableCell>
                        <TableCell>
                          {patient.visites?.length ? 
                            new Date(patient.visites[patient.visites.length - 1].date).toLocaleDateString('fr-FR') : 
                            'Aucune visite'
                          }
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              onClick={() => handleViewDossier(patient.id)}
                            >
                              Voir le dossier
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                              onClick={() => {
                                if (window.confirm(`Êtes-vous sûr de vouloir supprimer le patient ${patient.nom} ${patient.prenom} ?`)) {
                                  handleDeletePatient(patient.id, `${patient.nom} ${patient.prenom}`);
                                }
                              }}
                              disabled={isDeleting}
                            >
                              {isDeleting ? (
                                <span className="animate-spin">⏳</span>
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
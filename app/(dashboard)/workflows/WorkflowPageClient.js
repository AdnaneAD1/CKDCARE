'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, AlertCircle, Activity, Calendar } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { useWorkflows } from '@/hooks/use-workflows';

export default function WorkflowPageClient() {
  const { toast } = useToast();
  const { workflows, isLoading, createWorkflow, updateWorkflow, deleteWorkflow } = useWorkflows();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null); // Stocke l'ID du workflow en cours de suppression
  const [newWorkflow, setNewWorkflow] = useState({
    nom: '',
    description: '',
    stade: '',
    examens_reguliers: [],
    alertes: []
  });
  const [nouvelExamen, setNouvelExamen] = useState({ type: '', frequence: '' });
  const [nouvelleAlerte, setNouvelleAlerte] = useState({ indicateur: '', condition: '', message: '' });

  const handleAddExamen = () => {
    if (!nouvelExamen.type || !nouvelExamen.frequence) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs de l'examen",
        variant: "destructive"
      });
      return;
    }
    setNewWorkflow({
      ...newWorkflow,
      examens_reguliers: [...newWorkflow.examens_reguliers, { ...nouvelExamen }]
    });
    setNouvelExamen({ type: '', frequence: '' });
  };

  const handleAddAlerte = () => {
    if (!nouvelleAlerte.indicateur || !nouvelleAlerte.condition || !nouvelleAlerte.message) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs de l'alerte",
        variant: "destructive"
      });
      return;
    }
    setNewWorkflow({
      ...newWorkflow,
      alertes: [...newWorkflow.alertes, { ...nouvelleAlerte }]
    });
    setNouvelleAlerte({ indicateur: '', condition: '', message: '' });
  };

  const handleSaveWorkflow = async () => {
    if (!newWorkflow.nom || !newWorkflow.stade) {
      toast({
        title: "Erreur",
        description: "Le nom et le stade sont requis",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      let success;
      if (editingWorkflow) {
        success = await updateWorkflow(editingWorkflow.id, newWorkflow);
      } else {
        success = await createWorkflow(newWorkflow);
      }

      if (success) {
        setDialogOpen(false);
        setNewWorkflow({
          nom: '',
          description: '',
          stade: '',
          examens_reguliers: [],
          alertes: []
        });
        setEditingWorkflow(null);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (workflow) => {
    setEditingWorkflow(workflow);
    setNewWorkflow({
      nom: workflow.nom,
      description: workflow.description,
      stade: workflow.stade,
      examens_reguliers: workflow.examens_reguliers,
      alertes: workflow.alertes
    });
    setDialogOpen(true);
  };

  const handleNewWorkflow = () => {
    setEditingWorkflow(null);
    setNewWorkflow({
      nom: '',
      description: '',
      stade: '',
      examens_reguliers: [],
      alertes: []
    });
    setDialogOpen(true);
  };

  const handleDelete = async (workflowId) => {
    setIsDeleting(workflowId);
    try {
      await deleteWorkflow(workflowId);
    } finally {
      setIsDeleting(null);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div>Chargement...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Workflows de Suivi</h1>
          <p className="text-muted-foreground">Gérez les protocoles de suivi personnalisés</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewWorkflow}>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau Workflow
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingWorkflow ? "Modifier le Workflow" : "Créer un Nouveau Workflow"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nom du workflow</Label>
                  <Input
                    value={newWorkflow.nom}
                    onChange={(e) => setNewWorkflow({...newWorkflow, nom: e.target.value})}
                    placeholder="Ex: Suivi MRC Stade 3"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Stade MRC</Label>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    value={newWorkflow.stade}
                    onChange={(e) => setNewWorkflow({...newWorkflow, stade: e.target.value})}
                    placeholder="1-5"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={newWorkflow.description}
                  onChange={(e) => setNewWorkflow({...newWorkflow, description: e.target.value})}
                  placeholder="Décrivez le protocole de suivi..."
                />
              </div>

              <div className="space-y-4">
                <Label>Examens Réguliers</Label>
                {newWorkflow.examens_reguliers.map((examen, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-secondary rounded-md">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1">
                      {examen.type} - Tous les {examen.frequence}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setNewWorkflow({
                        ...newWorkflow,
                        examens_reguliers: newWorkflow.examens_reguliers.filter((_, i) => i !== index)
                      })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    placeholder="Type d'examen"
                    value={nouvelExamen.type}
                    onChange={(e) => setNouvelExamen({...nouvelExamen, type: e.target.value})}
                  />
                  <Input
                    placeholder="Fréquence"
                    value={nouvelExamen.frequence}
                    onChange={(e) => setNouvelExamen({...nouvelExamen, frequence: e.target.value})}
                  />
                  <Button type="button" variant="outline" onClick={handleAddExamen}>
                    Ajouter
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Alertes</Label>
                {newWorkflow.alertes.map((alerte, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-secondary rounded-md">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <span className="flex-1">
                      {alerte.indicateur} {alerte.condition} : {alerte.message}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setNewWorkflow({
                        ...newWorkflow,
                        alertes: newWorkflow.alertes.filter((_, i) => i !== index)
                      })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    placeholder="Indicateur"
                    value={nouvelleAlerte.indicateur}
                    onChange={(e) => setNouvelleAlerte({...nouvelleAlerte, indicateur: e.target.value})}
                  />
                  <Input
                    placeholder="Condition (ex: >5.5)"
                    value={nouvelleAlerte.condition}
                    onChange={(e) => setNouvelleAlerte({...nouvelleAlerte, condition: e.target.value})}
                  />
                  <Input
                    placeholder="Message d'alerte"
                    value={nouvelleAlerte.message}
                    onChange={(e) => setNouvelleAlerte({...nouvelleAlerte, message: e.target.value})}
                  />
                </div>
                <Button type="button" variant="outline" onClick={handleAddAlerte} className="w-full">
                  Ajouter une Alerte
                </Button>
              </div>

              <Button onClick={handleSaveWorkflow} disabled={isSaving}>
                {isSaving ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" fill="currentColor" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S16.627 6 12 6z" />
                    </svg>
                    {editingWorkflow ? "Mise à jour..." : "Création..."}
                  </div>
                ) : (
                  editingWorkflow ? "Mettre à jour" : "Créer le Workflow"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {workflows.map((workflow) => (
          <Card key={workflow.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">
                    {workflow.nom}
                    <span className="ml-2 text-sm text-muted-foreground">
                      (Stade {workflow.stade})
                    </span>
                  </CardTitle>
                  <p className="text-muted-foreground mt-1">{workflow.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(workflow)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(workflow.id)} disabled={isDeleting === workflow.id}>
                    {isDeleting === workflow.id ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" fill="currentColor" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S16.627 6 12 6z" />
                        </svg>
                      </div>
                    ) : (
                      <Trash2 className="h-4 w-4 text-destructive" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Examens Réguliers
                  </h3>
                  <div className="space-y-2">
                    {workflow.examens_reguliers.map((examen, index) => (
                      <div key={index} className="p-2 bg-secondary rounded-md">
                        <span className="font-medium">{examen.type}</span>
                        <span className="text-muted-foreground"> - Tous les {examen.frequence}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Alertes
                  </h3>
                  <div className="space-y-2">
                    {workflow.alertes.map((alerte, index) => (
                      <div key={index} className="p-2 bg-secondary rounded-md">
                        <span className="font-medium">{alerte.indicateur} {alerte.condition}</span>
                        <p className="text-sm text-muted-foreground mt-1">{alerte.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
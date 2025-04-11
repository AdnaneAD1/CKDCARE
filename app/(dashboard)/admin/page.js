'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, UserPlus, Edit2, Trash2, Key, Shield } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import AdminRouteGuard from '@/components/admin-route-guard'
import useAdmin from '@/hooks/use-admin'



export default function AdminPage() {
  const { toast } = useToast()
  const { 
    doctors, 
    loading, 
    fetchDoctors, 
    addDoctor, 
    updateDoctor, 
    deleteDoctor, 
    updateDoctorPassword, 
    searchDoctors 
  } = useAdmin()
  const [searchTerm, setSearchTerm] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [newDoctor, setNewDoctor] = useState({
    nom: '',
    prenom: '',
    email: '',
    specialite: '',
    password: ''
  })
  const [newPassword, setNewPassword] = useState({
    current: '',
    password: '',
    confirm: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  
  // Charger la liste des médecins au chargement de la page
  useEffect(() => {
    fetchDoctors()
  }, [])

  const handleSearch = (value) => {
    setSearchTerm(value)
    searchDoctors(value)
  }

  const handleAddDoctor = async () => {
    if (!newDoctor.nom || !newDoctor.prenom || !newDoctor.email || !newDoctor.specialite || !newDoctor.password) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    const success = await addDoctor(newDoctor)
    setIsSubmitting(false)
    
    if (success) {
      setNewDoctor({
        nom: '',
        prenom: '',
        email: '',
        specialite: '',
        password: ''
      })
      setDialogOpen(false)
    }
  }

  const handleEditDoctor = (doctor) => {
    setSelectedDoctor(doctor)
    setNewDoctor({
      nom: doctor.nom,
      prenom: doctor.prenom,
      email: doctor.email,
      specialite: doctor.specialite,
      password: ''
    })
    setDialogOpen(true)
  }

  const handleUpdateDoctor = async () => {
    if (!newDoctor.nom || !newDoctor.prenom || !newDoctor.email || !newDoctor.specialite) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    const success = await updateDoctor(selectedDoctor.id, newDoctor)
    setIsSubmitting(false)
    
    if (success) {
      setDialogOpen(false)
      setSelectedDoctor(null)
      setNewDoctor({
        nom: '',
        prenom: '',
        email: '',
        specialite: '',
        password: ''
      })
    }
  }

  const handleDeleteDoctor = async (doctorId) => {
    setIsDeleting(true)
    await deleteDoctor(doctorId)
    setIsDeleting(false)
  }

  const handleChangePassword = (doctorId) => {
    const doctor = doctors.find(doc => doc.id === doctorId)
    setSelectedDoctor(doctor)
    setPasswordDialogOpen(true)
  }

  const handleUpdatePassword = async () => {
    if (!newPassword.password || !newPassword.confirm) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive"
      })
      return
    }

    if (newPassword.password !== newPassword.confirm) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive"
      })
      return
    }

    setIsChangingPassword(true)
    const success = await updateDoctorPassword(selectedDoctor.id, newPassword)
    setIsChangingPassword(false)
    
    if (success) {
      setPasswordDialogOpen(false)
      setSelectedDoctor(null)
      setNewPassword({
        current: '',
        password: '',
        confirm: ''
      })
    }
  }

  return (
    <DashboardLayout>
      <AdminRouteGuard>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Administration</h1>
            <p className="text-muted-foreground">Gestion des médecins et des accès</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (open && !selectedDoctor) {
              // Réinitialiser le formulaire quand on l'ouvre pour un nouveau médecin
              setNewDoctor({
                nom: '',
                prenom: '',
                email: '',
                specialite: '',
                password: ''
              });
            } else if (!open) {
              // Réinitialiser selectedDoctor quand on ferme le dialogue
              setSelectedDoctor(null);
            }
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => setSelectedDoctor(null)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Nouveau Médecin
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {selectedDoctor ? "Modifier un médecin" : "Ajouter un nouveau médecin"}
                </DialogTitle>
                <DialogDescription>
                  {selectedDoctor 
                    ? "Modifiez les informations du médecin"
                    : "Remplissez les informations pour créer un nouveau compte médecin"
                  }
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nom</Label>
                    <Input
                      value={newDoctor.nom}
                      onChange={(e) => setNewDoctor({...newDoctor, nom: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Prénom</Label>
                    <Input
                      value={newDoctor.prenom}
                      onChange={(e) => setNewDoctor({...newDoctor, prenom: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={newDoctor.email}
                    onChange={(e) => setNewDoctor({...newDoctor, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Spécialité</Label>
                  <Select
                    value={newDoctor.specialite}
                    onValueChange={(value) => setNewDoctor({...newDoctor, specialite: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une spécialité" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Néphrologie">Néphrologie</SelectItem>
                      <SelectItem value="Cardiologie">Cardiologie</SelectItem>
                      <SelectItem value="Médecine Générale">Médecine Générale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {!selectedDoctor && (
                  <div className="space-y-2">
                    <Label>Mot de passe initial</Label>
                    <Input
                      type="password"
                      value={newDoctor.password}
                      onChange={(e) => setNewDoctor({...newDoctor, password: e.target.value})}
                    />
                  </div>
                )}
                <Button 
                  onClick={selectedDoctor ? handleUpdateDoctor : handleAddDoctor}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      {selectedDoctor ? "Mise à jour..." : "Création..."}
                    </>
                  ) : (
                    selectedDoctor ? "Mettre à jour" : "Créer le compte"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un médecin..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Liste des Médecins</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Spécialité</TableHead>
                  <TableHead>Date de création</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {doctors.map((doctor) => (
                  <TableRow key={doctor.id}>
                    <TableCell>
                      {doctor.nom} {doctor.prenom}
                    </TableCell>
                    <TableCell>{doctor.email}</TableCell>
                    <TableCell>{doctor.specialite}</TableCell>
                    <TableCell>{doctor.dateCreation}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        doctor.status === 'actif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {doctor.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditDoctor(doctor)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleChangePassword(doctor.id)}
                        >
                          <Key className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer le médecin</AlertDialogTitle>
                              <AlertDialogDescription>
                                Êtes-vous sûr de vouloir supprimer ce médecin ? Cette action ne peut pas être annulée.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteDoctor(doctor.id)}
                                disabled={isDeleting}
                              >
                                {isDeleting ? (
                                  <>
                                    <span className="animate-spin mr-2">⏳</span>
                                    Suppression...
                                  </>
                                ) : (
                                  "Supprimer"
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Changer le mot de passe</DialogTitle>
              <DialogDescription>
                {selectedDoctor && `Modification du mot de passe pour ${selectedDoctor.nom} ${selectedDoctor.prenom}`}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Nouveau mot de passe</Label>
                <Input
                  type="password"
                  value={newPassword.password}
                  onChange={(e) => setNewPassword({...newPassword, password: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Confirmer le mot de passe</Label>
                <Input
                  type="password"
                  value={newPassword.confirm}
                  onChange={(e) => setNewPassword({...newPassword, confirm: e.target.value})}
                />
              </div>
              <Button 
                onClick={handleUpdatePassword}
                disabled={isChangingPassword}
              >
                {isChangingPassword ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Mise à jour...
                  </>
                ) : (
                  "Mettre à jour le mot de passe"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </AdminRouteGuard>
    </DashboardLayout>
  )
}
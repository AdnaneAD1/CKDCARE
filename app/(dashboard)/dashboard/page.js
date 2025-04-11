'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Users, AlertTriangle, Calendar, Loader2 } from 'lucide-react'
import { useDashboard } from '@/hooks/use-dashboard'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()
  const { dashboardData, isLoading, error, fetchDashboardData } = useDashboard()

  const handleAlertClick = () => {
    router.push('/notifications')
  }

  const handlePatientsClick = () => {
    router.push('/patients')
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[70vh]">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-medium">Chargement des données...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3">
        <Card onClick={handlePatientsClick} className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Patients Suivis</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.patients.total}</div>
          </CardContent>
        </Card>
        <Card onClick={handleAlertClick} className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Alertes Urgentes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{dashboardData.alerts.total}</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">RDV du Jour</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.appointments.today}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Évolution des Patients par Stade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboardData.evolution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis width={50} tickFormatter={(value) => `${value}`} />
                <Tooltip />
                <Line type="monotone" dataKey="stade1" stroke="#8884d8" name="Stade 1" />
                <Line type="monotone" dataKey="stade2" stroke="#82ca9d" name="Stade 2" />
                <Line type="monotone" dataKey="stade3" stroke="#ffc658" name="Stade 3" />
                <Line type="monotone" dataKey="stade4" stroke="#ff8042" name="Stade 4" />
                <Line type="monotone" dataKey="stade5" stroke="#ff0000" name="Stade 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Section des rendez-vous du jour */}
      {dashboardData.appointments.todayItems && dashboardData.appointments.todayItems.length > 0 && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Rendez-vous du jour</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Patient</th>
                    <th className="text-left py-2 px-4">Dossier</th>
                    <th className="text-left py-2 px-4">Heure</th>
                    <th className="text-left py-2 px-4">Motif</th>
                    <th className="text-left py-2 px-4">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.appointments.todayItems.map((appointment) => (
                    <tr key={appointment.id} className="border-b hover:bg-muted/50 cursor-pointer"
                        onClick={() => router.push(`/dossiers/${appointment.patient_id}`)}>
                      <td className="py-2 px-4">{appointment.patient_nom}</td>
                      <td className="py-2 px-4">{appointment.numero_dossier}</td>
                      <td className="py-2 px-4">{appointment.heure}</td>
                      <td className="py-2 px-4">{appointment.motif}</td>
                      <td className="py-2 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${appointment.status === 'terminé' ? 'bg-green-100 text-green-800' : appointment.status === 'en_cours' ? 'bg-blue-100 text-blue-800' : appointment.status === 'planifié' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section des alertes */}
      {dashboardData.alerts.items && dashboardData.alerts.items.length > 0 && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Alertes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Patient</th>
                    <th className="text-left py-2 px-4">Dossier</th>
                    <th className="text-left py-2 px-4">Date</th>
                    <th className="text-left py-2 px-4">Motif</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.alerts.items.map((alert) => (
                    <tr key={alert.id} className="border-b hover:bg-red-50 cursor-pointer"
                        onClick={() => router.push(`/dossiers/${alert.patient_id}`)}>
                      <td className="py-2 px-4">{alert.patient_nom}</td>
                      <td className="py-2 px-4">{alert.numero_dossier}</td>
                      <td className="py-2 px-4">{alert.date}</td>
                      <td className="py-2 px-4">{alert.motif}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  )
}
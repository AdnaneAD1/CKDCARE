<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Patient;
use App\Models\Visite;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use App\Traits\HasMedecinRole;

class DashboardController extends Controller
{
    /**
     * Ru00e9cupu00e8re les donnu00e9es pour le tableau de bord
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        // Vérification que l'utilisateur est un médecin
        if (!$request->user()->isMedecin() && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $medecinId = $request->user()->id;
        $today = Carbon::today();
        $sixMonthsAgo = Carbon::today()->subMonths(6);

        // 1. Nombre total de patients
        $totalPatients = Patient::where('medecin_id', $medecinId)->count();

        // 2. Ru00e9partition des patients par stade
        $patientsByStage = Patient::where('medecin_id', $medecinId)
            ->select('stade', DB::raw('count(*) as total'))
            ->groupBy('stade')
            ->get()
            ->mapWithKeys(function ($item) {
                return ['stade'.($item->stade ?? 'NA') => $item->total];
            })
            ->toArray();

        // S'assurer que tous les stades sont pru00e9sents
        $patientsByStage = array_merge(
            ['stade1' => 0, 'stade2' => 0, 'stade3' => 0, 'stade4' => 0, 'stade5' => 0],
            $patientsByStage
        );

        // 3. Nombre d'alertes urgentes (visites avec statut planifiu00e9 pour aujourd'hui ou passu00e9es)
        $alertes = Visite::whereHas('patient', function ($query) use ($medecinId) {
                $query->where('medecin_id', $medecinId);
            })
            ->where('status', 'planifiu00e9')
            ->where('date', '<=', $today)
            ->orderBy('date')
            ->with(['patient:id,nom,prenom,numero_dossier'])
            ->get()
            ->map(function ($visite) {
                return [
                    'id' => $visite->id,
                    'patient_id' => $visite->patient_id,
                    'patient_nom' => $visite->patient->nom . ' ' . $visite->patient->prenom,
                    'numero_dossier' => $visite->patient->numero_dossier,
                    'date' => $visite->date,
                    'motif' => $visite->motif,
                    'status' => $visite->status
                ];
            });

        // 4. Rendez-vous du jour
        $appointmentsToday = Visite::whereHas('patient', function ($query) use ($medecinId) {
                $query->where('medecin_id', $medecinId);
            })
            ->whereDate('date', $today)
            ->orderBy('heure')
            ->with(['patient:id,nom,prenom,numero_dossier'])
            ->get()
            ->map(function ($visite) {
                return [
                    'id' => $visite->id,
                    'patient_id' => $visite->patient_id,
                    'patient_nom' => $visite->patient->nom . ' ' . $visite->patient->prenom,
                    'numero_dossier' => $visite->patient->numero_dossier,
                    'date' => $visite->date,
                    'heure' => $visite->heure,
                    'motif' => $visite->motif,
                    'status' => $visite->status
                ];
            });

        // 5. Prochains rendez-vous (7 prochains jours)
        $upcomingAppointments = Visite::whereHas('patient', function ($query) use ($medecinId) {
                $query->where('medecin_id', $medecinId);
            })
            ->whereDate('date', '>', $today)
            ->whereDate('date', '<=', Carbon::today()->addDays(7))
            ->orderBy('date')
            ->orderBy('heure')
            ->with(['patient:id,nom,prenom,numero_dossier'])
            ->get()
            ->map(function ($visite) {
                return [
                    'id' => $visite->id,
                    'patient_id' => $visite->patient_id,
                    'patient_nom' => $visite->patient->nom . ' ' . $visite->patient->prenom,
                    'numero_dossier' => $visite->patient->numero_dossier,
                    'date' => $visite->date,
                    'heure' => $visite->heure,
                    'motif' => $visite->motif,
                    'status' => $visite->status
                ];
            });

        // 6. u00c9volution des patients par stade sur les 6 derniers mois
        $evolution = [];
        
        // Parcourir les 6 derniers mois
        for ($i = 5; $i >= 0; $i--) {
            $month = Carbon::today()->subMonths($i);
            $monthStart = Carbon::today()->subMonths($i)->startOfMonth();
            $monthEnd = Carbon::today()->subMonths($i)->endOfMonth();
            
            // Ru00e9cupu00e9rer les patients cru00e9u00e9s avant la fin du mois
            $patientsThisMonth = Patient::where('medecin_id', $medecinId)
                ->where('created_at', '<=', $monthEnd)
                ->get();
            
            // Compter par stade
            $stade1Count = $patientsThisMonth->where('stade', '1')->count();
            $stade2Count = $patientsThisMonth->where('stade', '2')->count();
            $stade3Count = $patientsThisMonth->where('stade', '3')->count();
            $stade4Count = $patientsThisMonth->where('stade', '4')->count();
            $stade5Count = $patientsThisMonth->where('stade', '5')->count();
            
            $evolution[] = [
                'month' => $month->format('M'),
                'stade1' => $stade1Count,
                'stade2' => $stade2Count,
                'stade3' => $stade3Count,
                'stade4' => $stade4Count,
                'stade5' => $stade5Count,
            ];
        }

        return response()->json([
            'patients' => [
                'total' => $totalPatients,
                'byStage' => $patientsByStage
            ],
            'alerts' => [
                'total' => $alertes->count(),
                'items' => $alertes
            ],
            'appointments' => [
                'today' => $appointmentsToday->count(),
                'upcoming' => $upcomingAppointments->count(),
                'todayItems' => $appointmentsToday,
                'upcomingItems' => $upcomingAppointments
            ],
            'evolution' => $evolution
        ]);
    }
}

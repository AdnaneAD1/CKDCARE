<?php

namespace App\Http\Controllers;

use App\Models\Workflow;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class WorkflowController extends Controller
{
    public function index()
    {
        try {
            $query = Workflow::query();

            if (Auth::user()->isMedecin()) {
                $query->where('medecin_id', Auth::id());
            }

            $workflows = $query->with('medecin')->get();

            return response()->json([
                'message' => 'Liste des workflows récupérée avec succès',
                'workflows' => $workflows
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la récupération des workflows',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nom' => 'required|string|max:255',
            'description' => 'nullable|string',
            'stade' => 'required|string',
            'examens_reguliers' => 'required|array',
            'examens_reguliers.*.type' => 'required|string',
            'examens_reguliers.*.frequence' => 'required|string',
            'alertes' => 'required|array',
            'alertes.*.indicateur' => 'required|string',
            'alertes.*.condition' => 'required|string',
            'alertes.*.message' => 'required|string',
            'patient_id' => 'nullable|exists:patients,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $workflow = Workflow::create([
                ...$request->except('patient_id'),
                'medecin_id' => Auth::id()
            ]);

            if ($request->has('patient_id')) {
                $this->assignWorkflowToPatient($workflow, $request->patient_id);
            }

            return response()->json([
                'message' => 'Workflow créé avec succès',
                'workflow' => $workflow->load('medecin')
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la création du workflow',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'nom' => 'required|string|max:255',
            'description' => 'nullable|string',
            'stade' => 'required|string',
            'examens_reguliers' => 'required|array',
            'examens_reguliers.*.type' => 'required|string',
            'examens_reguliers.*.frequence' => 'required|string',
            'alertes' => 'required|array',
            'alertes.*.indicateur' => 'required|string',
            'alertes.*.condition' => 'required|string',
            'alertes.*.message' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $query = Workflow::query();

            if (Auth::user()->isMedecin()) {
                $query->where('medecin_id', Auth::id());
            }

            $workflow = $query->findOrFail($id);
            $workflow->update($request->all());

            return response()->json([
                'message' => 'Workflow mis à jour avec succès',
                'workflow' => $workflow->load('medecin')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la mise à jour du workflow',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $query = Workflow::query();

            if (Auth::user()->isMedecin()) {
                $query->where('medecin_id', Auth::id());
            }

            $workflow = $query->findOrFail($id);
            $workflow->delete();

            return response()->json([
                'message' => 'Workflow supprimé avec succès'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la suppression du workflow',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function assignToPatient(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'patient_id' => 'required|exists:patients,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $workflow = Workflow::findOrFail($id);
            $this->assignWorkflowToPatient($workflow, $request->patient_id);

            return response()->json([
                'message' => 'Workflow assigné au patient avec succès'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de l\'assignation du workflow',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function assignWorkflowToPatient(Workflow $workflow, $patientId)
    {
        $patient = Patient::findOrFail($patientId);

        // Vérifier si le médecin a accès au patient
        if (Auth::user()->isMedecin() && $patient->medecin_id !== Auth::id()) {
            throw new \Exception('Accès non autorisé à ce patient');
        }

        // Création des rappels
        $rappels = [];
        $now = Carbon::now();
        
        foreach ($workflow->examens_reguliers as $examen) {
            $frequence = $this->parseFrequence($examen['frequence']);
            for ($i = 1; $i <= 5; $i++) {
                $date = $now->copy()->addMonths($frequence * $i);
                $rappels[] = [
                    'type' => $examen['type'],
                    'date_prevue' => $date->format('Y-m-d'),
                    'statut' => 'planifie'
                ];
            }
        }

        $patient->workflows()->attach($workflow->id, [
            'rappels' => $rappels
        ]);
    }

    private function parseFrequence($frequence)
    {
        $frequence = strtolower($frequence);
        if (strpos($frequence, 'mois') !== false) {
            return (int) filter_var($frequence, FILTER_SANITIZE_NUMBER_INT);
        }
        if (strpos($frequence, 'an') !== false || strpos($frequence, 'année') !== false) {
            return (int) filter_var($frequence, FILTER_SANITIZE_NUMBER_INT) * 12;
        }
        return (int) filter_var($frequence, FILTER_SANITIZE_NUMBER_INT);
    }

    public function show($id)
    {
        try {
            $query = Workflow::with(['medecin', 'patients']);

            if (Auth::user()->isMedecin()) {
                $query->where('medecin_id', Auth::id());
            }

            $workflow = $query->findOrFail($id);

            return response()->json([
                'message' => 'Workflow récupéré avec succès',
                'workflow' => $workflow
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Workflow non trouvé ou accès non autorisé',
                'error' => $e->getMessage()
            ], 404);
        }
    }
}

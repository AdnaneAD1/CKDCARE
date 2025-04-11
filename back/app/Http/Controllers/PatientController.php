<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class PatientController extends Controller
{
    public function index(Request $request)
    {
        $query = Patient::query();

        // Si l'utilisateur est un médecin, ne montrer que ses patients
        if (Auth::user()->isMedecin()) {
            $query->where('medecin_id', Auth::id());
        }

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('nom', 'like', "%$search%")
                  ->orWhere('prenom', 'like', "%$search%")
                  ->orWhere('numero_secu', 'like', "%$search%")
                  ->orWhere('numero_dossier', 'like', "%$search%");
            });
        }

        $patients = $query->with(['visites', 'dossier', 'medecin'])->paginate(10);
        return response()->json($patients);
    }

    public function getAllPatients()
    {
        try {
            $query = Patient::with(['dossier', 'visites', 'medecin']);

            // Si l'utilisateur est un médecin, ne montrer que ses patients
            if (Auth::user()->isMedecin()) {
                $query->where('medecin_id', Auth::id());
            }

            $patients = $query
                ->orderBy('nom')
                ->orderBy('prenom')
                ->get();

            return response()->json([
                'message' => 'Liste de tous les patients récupérée avec succès',
                'patients' => $patients
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la récupération des patients',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'date_naissance' => 'required|date',
            'sexe' => 'required|in:M,F',
            'adresse' => 'nullable|string',
            'telephone' => 'nullable|string|max:20',
            'email' => 'nullable|email|unique:patients,email',
            'numero_secu' => 'required|string|unique:patients',
            'medecin_referent' => 'nullable|string|max:255',
            'stade' => 'nullable|string|max:10',
            'antecedents' => 'nullable|array',
            'traitements' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Ajouter l'ID du médecin connecté
            $data = $request->all();
            $data['medecin_id'] = Auth::id();

            $patient = Patient::create($data);

            return response()->json([
                'message' => 'Patient enregistré avec succès',
                'patient' => $patient->load(['dossier', 'medecin']),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de l\'enregistrement du patient',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $query = Patient::with(['visites', 'dossier', 'medecin']);

            // Si l'utilisateur est un médecin, vérifier que le patient lui appartient
            if (Auth::user()->isMedecin()) {
                $query->where('medecin_id', Auth::id());
            }

            $patient = $query->findOrFail($id);
            return response()->json($patient);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Patient non trouvé ou accès non autorisé',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'nom' => 'string|max:255',
            'prenom' => 'string|max:255',
            'date_naissance' => 'date',
            'sexe' => 'in:M,F',
            'adresse' => 'nullable|string',
            'telephone' => 'nullable|string|max:20',
            'email' => 'nullable|email|unique:patients,email,' . $id,
            'numero_secu' => 'string|unique:patients,numero_secu,' . $id,
            'medecin_referent' => 'nullable|string|max:255',
            'stade' => 'nullable|string|max:10',
            'antecedents' => 'nullable|array',
            'traitements' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $query = Patient::query();

            // Si l'utilisateur est un médecin, vérifier que le patient lui appartient
            if (Auth::user()->isMedecin()) {
                $query->where('medecin_id', Auth::id());
            }

            $patient = $query->findOrFail($id);
            $patient->update($request->all());

            return response()->json([
                'message' => 'Patient mis à jour avec succès',
                'patient' => $patient->load(['dossier', 'medecin'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Patient non trouvé ou accès non autorisé',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $patient = Patient::findOrFail($id);
            $patient->delete();
            return response()->json([
                'message' => 'Patient supprimé avec succès'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Patient non trouvé ou accès non autorisé',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

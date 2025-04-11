<?php

namespace App\Http\Controllers;

use App\Models\Dossier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DossierController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Dossier::with(['patient', 'patient.medecin']);

            // Si l'utilisateur est un médecin, ne montrer que les dossiers de ses patients
            if (Auth::user()->isMedecin()) {
                $query->whereHas('patient', function ($q) {
                    $q->where('medecin_id', Auth::id());
                });
            }

            // Filtrer par statut si spécifié
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            // Recherche par numéro de dossier ou nom du patient
            if ($request->has('search')) {
                $search = $request->input('search');
                $query->where(function ($q) use ($search) {
                    $q->where('numero_dossier', 'like', "%$search%")
                      ->orWhereHas('patient', function ($q) use ($search) {
                          $q->where('nom', 'like', "%$search%")
                            ->orWhere('prenom', 'like', "%$search%");
                      });
                });
            }

            // Tri par date de création par défaut
            $query->orderBy('created_at', 'desc');

            $dossiers = $query->paginate(10);

            return response()->json([
                'message' => 'Liste des dossiers récupérée avec succès',
                'dossiers' => $dossiers
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la récupération des dossiers',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $query = Dossier::with(['patient', 'patient.medecin', 'patient.visites']);

            // Si l'utilisateur est un médecin, vérifier que le dossier appartient à un de ses patients
            if (Auth::user()->isMedecin()) {
                $query->whereHas('patient', function ($q) {
                    $q->where('medecin_id', Auth::id());
                });
            }

            $dossier = $query->findOrFail($id);

            return response()->json([
                'message' => 'Dossier récupéré avec succès',
                'dossier' => $dossier
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Dossier non trouvé ou accès non autorisé',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $query = Dossier::query();

            // Si l'utilisateur est un médecin, vérifier que le dossier appartient à un de ses patients
            if (Auth::user()->isMedecin()) {
                $query->whereHas('patient', function ($q) {
                    $q->where('medecin_id', Auth::id());
                });
            }

            $dossier = $query->findOrFail($id);
            
            // Mise à jour du statut si spécifié
            if ($request->has('status')) {
                $dossier->status = $request->status;
            }

            // Mise à jour des documents si spécifiés
            if ($request->has('documents')) {
                $dossier->documents = $request->documents;
            }

            $dossier->save();

            return response()->json([
                'message' => 'Dossier mis à jour avec succès',
                'dossier' => $dossier->fresh(['patient', 'patient.medecin', 'patient.visites'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Dossier non trouvé ou accès non autorisé',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function search(Request $request)
    {
        try {
            $query = Dossier::with(['patient', 'patient.medecin']);

            // Si l'utilisateur est un médecin, ne montrer que les dossiers de ses patients
            if (Auth::user()->isMedecin()) {
                $query->whereHas('patient', function ($q) {
                    $q->where('medecin_id', Auth::id());
                });
            }

            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            if ($request->has('search')) {
                $search = $request->input('search');
                $query->where(function ($q) use ($search) {
                    $q->where('numero_dossier', 'like', "%$search%")
                      ->orWhereHas('patient', function ($q) use ($search) {
                          $q->where('nom', 'like', "%$search%")
                            ->orWhere('prenom', 'like', "%$search%");
                      });
                });
            }

            $dossiers = $query->get();

            return response()->json([
                'message' => 'Recherche effectuée avec succès',
                'dossiers' => $dossiers
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la recherche',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mettre à jour uniquement le statut d'un dossier
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateStatus(Request $request, $id)
    {
        try {
            $request->validate([
                'status' => 'required|string|in:en_cours,urgent,stable'
            ]);

            $query = Dossier::query();

            // Si l'utilisateur est un médecin, vérifier que le dossier appartient à un de ses patients
            if (Auth::user()->isMedecin()) {
                $query->whereHas('patient', function ($q) {
                    $q->where('medecin_id', Auth::id());
                });
            }

            $dossier = $query->findOrFail($id);
            $dossier->status = $request->status;
            $dossier->save();

            return response()->json([
                'message' => 'Statut du dossier mis à jour avec succès',
                'dossier' => $dossier->fresh(['patient'])
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Dossier non trouvé ou accès non autorisé'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la mise à jour du statut',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

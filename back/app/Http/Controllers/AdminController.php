<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Medecin;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    /**
     * Afficher la liste des médecins
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function listMedecins(Request $request)
    {
        // Vérifier que l'utilisateur est un administrateur
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $medecins = User::with('medecin')
            ->where('role', 'medecin')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'specialite' => $user->medecin->specialite ?? 'Non spécifiée',
                    'preferences_notifications' => $user->medecin->preferences_notifications ?? [],
                    'created_at' => $user->created_at,
                    'updated_at' => $user->updated_at
                ];
            });

        return response()->json([
            'medecins' => $medecins
        ]);
    }

    /**
     * Ajouter un nouveau médecin
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function addMedecin(Request $request)
    {
        // Vérifier que l'utilisateur est un administrateur
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', Password::defaults()],
            'specialite' => 'nullable|string|max:255',
            'preferences_notifications' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();

            // Créer l'utilisateur avec le rôle médecin
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'medecin'
            ]);

            // Mettre à jour les informations du médecin si spécifiées
            if ($request->has('specialite') || $request->has('preferences_notifications')) {
                $medecin = $user->medecin;
                
                if ($request->has('specialite')) {
                    $medecin->specialite = $request->specialite;
                }
                
                if ($request->has('preferences_notifications')) {
                    $medecin->preferences_notifications = $request->preferences_notifications;
                }
                
                $medecin->save();
            }

            DB::commit();
            event(new Registered($user));

            return response()->json([
                'message' => 'Médecin créé avec succès',
                'medecin' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'specialite' => $user->medecin->specialite,
                    'preferences_notifications' => $user->medecin->preferences_notifications
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erreur lors de la création du médecin', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Mettre à jour les informations d'un médecin
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateMedecin(Request $request, $id)
    {
        // Vérifier que l'utilisateur est un administrateur
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        // Trouver l'utilisateur médecin
        $user = User::with('medecin')->where('id', $id)->where('role', 'medecin')->first();

        if (!$user) {
            return response()->json(['message' => 'Médecin non trouvé'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|string|email|max:255|unique:users,email,' . $id,
            'specialite' => 'sometimes|nullable|string|max:255',
            'preferences_notifications' => 'sometimes|nullable|array'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();

            // Mettre à jour les informations de l'utilisateur
            if ($request->has('name')) {
                $user->name = $request->name;
            }

            if ($request->has('email')) {
                $user->email = $request->email;
            }

            $user->save();

            // Mettre à jour les informations du médecin
            if ($request->has('specialite') || $request->has('preferences_notifications')) {
                $medecin = $user->medecin;
                
                if ($request->has('specialite')) {
                    $medecin->specialite = $request->specialite;
                }
                
                if ($request->has('preferences_notifications')) {
                    $medecin->preferences_notifications = $request->preferences_notifications;
                }
                
                $medecin->save();
            }

            DB::commit();

            return response()->json([
                'message' => 'Médecin mis à jour avec succès',
                'medecin' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'specialite' => $user->medecin->specialite,
                    'preferences_notifications' => $user->medecin->preferences_notifications,
                    'updated_at' => $user->updated_at
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erreur lors de la mise à jour du médecin', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Supprimer un médecin
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteMedecin(Request $request, $id)
    {
        // Vérifier que l'utilisateur est un administrateur
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        // Trouver l'utilisateur médecin
        $user = User::with('medecin')->where('id', $id)->where('role', 'medecin')->first();

        if (!$user) {
            return response()->json(['message' => 'Médecin non trouvé'], 404);
        }

        try {
            DB::beginTransaction();

            // Vérifier si le médecin a des patients
            $patientsCount = $user->patients()->count();
            if ($patientsCount > 0) {
                return response()->json([
                    'message' => 'Ce médecin ne peut pas être supprimé car il a des patients associés',
                    'patients_count' => $patientsCount
                ], 422);
            }

            // Supprimer le profil médecin
            if ($user->medecin) {
                $user->medecin->delete();
            }

            // Supprimer l'utilisateur
            $user->delete();

            DB::commit();

            return response()->json([
                'message' => 'Médecin supprimé avec succès'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erreur lors de la suppression du médecin', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Modifier le mot de passe d'un médecin
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateMedecinPassword(Request $request, $id)
    {
        // Vérifier que l'utilisateur est un administrateur
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        // Trouver l'utilisateur médecin
        $user = User::where('id', $id)->where('role', 'medecin')->first();

        if (!$user) {
            return response()->json(['message' => 'Médecin non trouvé'], 404);
        }

        $validator = Validator::make($request->all(), [
            'password' => ['required', Password::defaults()],
            'password_confirmation' => 'required|same:password'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            // Mettre à jour le mot de passe
            $user->password = Hash::make($request->password);
            $user->save();

            return response()->json([
                'message' => 'Mot de passe du médecin mis à jour avec succès'
            ]);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur lors de la mise à jour du mot de passe', 'error' => $e->getMessage()], 500);
        }
    }
}

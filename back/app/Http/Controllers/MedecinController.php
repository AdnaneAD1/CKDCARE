<?php

namespace App\Http\Controllers;

use App\Models\Medecin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class MedecinController extends Controller
{
    public function show()
    {
        try {
            $medecin = Auth::user()->medecin()->with('user')->first();
            
            if (!$medecin) {
                return response()->json([
                    'message' => 'Profil médecin non trouvé'
                ], 404);
            }

            return response()->json([
                'message' => 'Profil médecin récupéré avec succès',
                'medecin' => $medecin
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la récupération du profil médecin',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'specialite' => 'required|string|max:255',
            'preferences_notifications' => 'required|array',
            'preferences_notifications.email' => 'required|boolean',
            'preferences_notifications.desktop' => 'required|boolean',
            'preferences_notifications.urgent' => 'required|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $medecin = Auth::user()->medecin;
            
            if (!$medecin) {
                return response()->json([
                    'message' => 'Profil médecin non trouvé'
                ], 404);
            }

            $medecin->update($request->all());

            // Mettre à jour le nom de l'utilisateur si fourni
            if ($request->has('name')) {
                Auth::user()->update(['name' => $request->name]);
            }
            if($request->has('email')) {
                Auth::user()->update(['email' => $request->email]);
            }

            return response()->json([
                'message' => 'Profil médecin mis à jour avec succès',
                'medecin' => $medecin->fresh(['user'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la mise à jour du profil médecin',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updatePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required|current_password',
            'password' => 'required|string|min:8|confirmed'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            Auth::user()->update([
                'password' => bcrypt($request->password)
            ]);

            return response()->json([
                'message' => 'Mot de passe mis à jour avec succès'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la mise à jour du mot de passe',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

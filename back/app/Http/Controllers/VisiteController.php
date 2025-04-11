<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\Visite;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class VisiteController extends Controller
{
    protected $twilio;
    protected $emailController;

    public function __construct(TwilioController $twilio, EmailController $emailController)
    {
        // Injecter TwilioController et EmailController
        $this->twilio = $twilio;
        $this->emailController = $emailController;
    }
    
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'patient_id' => 'required|exists:patients,id',
            'date' => 'required|date',
            'heure' => 'required|date_format:H:i',
            'medecin' => 'required|string|max:255',
            'motif' => 'required|string',
            'status' => 'required|in:planifié,en_cours,terminé,annulé',
            'examens' => 'nullable|array',
            'biologie' => 'nullable|array',
            'prescriptions' => 'nullable|array',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $visite = Visite::create($request->all());
            
            // Récupérer le patient
            $patient = Patient::find($request->patient_id);
            
            // Envoie de SMS
            $to = '+229'.$patient->telephone;
            $message = 'Vous avez une consultation planifiée avec le Dr '. $request->medecin . ' pour le '. $request->date . ' à ' . $request->heure . '! Veuillez vérifier votre mail pour plus de détail!';
            $this->twilio->sendSms($to, $message);
            
            // Préparation des pièces jointes pour l'email
            $attachments = [];
            
            // Génération du PDF d'examen si nécessaire
            if (!empty($request->examens) || !empty($request->biologie)) {
                $examenPdf = $this->emailController->generateExamenPDF($visite, $patient);
                $attachments[] = [
                    'pdf' => $examenPdf,
                    'name' => 'demande_examen_' . $patient->id . '_' . date('Ymd') . '.pdf'
                ];
            }
            
            // Génération du PDF d'ordonnance si nécessaire
            if (!empty($request->prescriptions)) {
                $ordonnancePdf = $this->emailController->generateOrdonnancePDF($visite, $patient);
                $attachments[] = [
                    'pdf' => $ordonnancePdf,
                    'name' => 'ordonnance_' . $patient->id . '_' . date('Ymd') . '.pdf'
                ];
            }
            
            // Envoi de l'email avec les pièces jointes
            $this->emailController->sendVisiteEmail($visite, $patient, $attachments);

            return response()->json([
                'message' => 'Visite enregistrée avec succès',
                'visite' => $visite
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de l\'enregistrement de la visite',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'date' => 'date',
            'heure' => 'date_format:H:i',
            'medecin' => 'string|max:255',
            'motif' => 'string',
            'status' => 'in:planifié,en_cours,terminé,annulé',
            'examens' => 'nullable|array',
            'biologie' => 'nullable|array',
            'prescriptions' => 'nullable|array',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $visite = Visite::findOrFail($id);
            if($request->date != $visite->date || $request->heure != $visite->heure) {
                //Envoie de sms
                $to = '+229'.Patient::find($request->patient_id)->telephone;
                $message = 'Votre consultation avec le Dr '. $request->medecin . ' pour le '. $visite->date . ' à ' . $visite->heure . ' a été reportée pour le '. $request->date . ' à ' . $request->heure . '! ';
                $this->twilio->sendSms($to, $message);
            }
            $visite->update($request->all());
            if($request->status === 'annulé') {
                if($visite->examens) {
                    foreach($visite->examens as $examen) {
                        $examen->resultat = 'Annulé';
                        $examen->save();
                    }
                }
                if($visite->biologies) {
                    foreach($visite->biologies as $biologie) {
                        $biologie->resultat = 'Annulé';
                        $biologie->save();
                    }
                }
                if($visite->prescriptions) {
                    foreach($visite->prescriptions as $prescription) {
                        $prescription->resultat = 'Annulé';
                        $prescription->save();
                    }
                }

                //Envoie de sms
                $to = '+229'.Patient::find($request->patient_id)->telephone;
                $message = 'Votre consultation avec le Dr '. $request->medecin . ' pour le '. $request->date . ' à ' . $request->heure . ' a été annulée!';
                $this->twilio->sendSms($to, $message);
            }

            return response()->json([
                'message' => 'Visite mise à jour avec succès',
                'visite' => $visite
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la mise à jour de la visite',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $visite = Visite::with('patient')->findOrFail($id);
            return response()->json($visite);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Visite non trouvée',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    public function getVisitesPatient($patientId)
    {
        try {
            $visites = Visite::where('patient_id', $patientId)
                ->orderBy('date', 'desc')
                ->orderBy('heure', 'desc')
                ->get();
            
            return response()->json($visites);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la récupération des visites',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Models\Patient;
use App\Models\Visite;
use Barryvdh\DomPDF\Facade\Pdf;

class EmailController extends Controller
{
    /**
     * Envoie un email au patient avec les informations de la visite
     * et les PDF d'examens et/ou d'ordonnance si nécessaire
     */
    public function sendVisiteEmail(Visite $visite, Patient $patient, $attachments = [])
    {
        try {
            $data = [
                'visite' => $visite,
                'patient' => $patient,
                'date' => date('d/m/Y', strtotime($visite->date)),
                'heure' => $visite->heure,
                'medecin' => $visite->medecin,
                'motif' => $visite->motif
            ];

            Mail::send('emails.visite', $data, function($message) use ($patient, $visite, $attachments) {
                $message->to($patient->email, $patient->nom . ' ' . $patient->prenom)
                    ->subject('Votre consultation médicale du ' . date('d/m/Y', strtotime($visite->date)));

                // Ajouter les pièces jointes
                foreach ($attachments as $attachment) {
                    $message->attachData(
                        $attachment['pdf']->output(),
                        $attachment['name'],
                        ['mime' => 'application/pdf']
                    );
                }
            });

            return true;
        } catch (\Exception $e) {
            Log::error('Erreur lors de l\'envoi de l\'email: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Génère un PDF d'examen à partir des données fournies
     */
    public function generateExamenPDF(Visite $visite, Patient $patient)
    {
        $data = [
            'visite' => $visite,
            'patient' => $patient,
            'examens' => $visite->examens,
            'biologie' => $visite->biologie
        ];

        $pdf = Pdf::loadView('examen', $data);
        return $pdf;
    }

    /**
     * Génère un PDF d'ordonnance à partir des données fournies
     */
    public function generateOrdonnancePDF(Visite $visite, Patient $patient)
    {
        $data = [
            'visite' => $visite,
            'patient' => $patient,
            'prescriptions' => $visite->prescriptions
        ];

        $pdf = Pdf::loadView('ordonnance', $data);
        return $pdf;
    }
}

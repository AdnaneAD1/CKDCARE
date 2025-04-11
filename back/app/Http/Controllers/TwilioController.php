<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Twilio\Rest\Client as TwilioClient;

class TwilioController extends Controller
{
    protected $twilio;

    public function __construct()
    {
        // Initialiser Twilio dans le constructeur du contrôleur
        $this->twilio = new TwilioClient(
            env('TWILIO_SID'),
            env('TWILIO_AUTH_TOKEN')
        );
    }

    public function sendSms($to, $message)
    {
        try {
            // Envoyer le SMS via Twilio
            $this->twilio->messages->create(
                $to,
                [
                    'from' => env('TWILIO_PHONE_NUMBER'),
                    'body' => $message,
                ]
            );

            return response()->json(['message' => 'SMS envoyé avec succès !']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Échec de l\'envoi du SMS.', 'error' => $e->getMessage()], 500);
        }
    }
}

<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Votre consultation médicale</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 10px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
        }
        h1 {
            color: #2563eb;
            font-size: 20px;
        }
        .info-section {
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .info-item {
            margin-bottom: 10px;
        }
        .label {
            font-weight: bold;
            margin-right: 5px;
        }
        .footer {
            margin-top: 40px;
            font-size: 12px;
            text-align: center;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 10px;
        }
        .button {
            display: inline-block;
            background-color: #2563eb;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo"><img src="https://res.cloudinary.com/djdogxq0d/image/upload/v1744366688/logo_s5eufg.png" alt="CKDCARE" width="150" height="150"></div>
    </div>

    <h1>Votre consultation médicale</h1>
    
    <p>Bonjour {{ $patient->prenom }} {{ $patient->nom }},</p>
    
    <p>Nous vous confirmons votre consultation médicale avec les détails suivants :</p>
    
    <div class="info-section">
        <div class="info-item">
            <span class="label">Date :</span>
            <span>{{ $date }}</span>
        </div>
        <div class="info-item">
            <span class="label">Heure :</span>
            <span>{{ $heure }}</span>
        </div>
        <div class="info-item">
            <span class="label">Médecin :</span>
            <span>{{ $medecin }}</span>
        </div>
        <div class="info-item">
            <span class="label">Motif :</span>
            <span>{{ $motif }}</span>
        </div>
    </div>
    
    @if(!empty($visite->examens) || !empty($visite->biologie))
    <p>Des examens ont été prescrits pour cette consultation. Vous trouverez en pièce jointe la demande d'examens à présenter au laboratoire.</p>
    @endif
    
    @if(!empty($visite->prescriptions))
    <p>Des médicaments ont été prescrits lors de cette consultation. Vous trouverez en pièce jointe l'ordonnance à présenter à votre pharmacien.</p>
    @endif
    
    <p>Pour toute question ou modification concernant votre rendez-vous, n'hésitez pas à nous contacter.</p>
    
    <p>Cordialement,</p>
    <p>L'équipe CKDCare</p>
    
    <div class="footer">
        <p>CKDCare - Suivi et gestion des patients atteints d'insuffisance rénale chronique</p>
        <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
    </div>
</body>
</html>

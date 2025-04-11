<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Ordonnance Médicale</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 10px;
        }
        .logo {
            font-weight: bold;
            color: #2563eb;
        }
        .title {
            font-size: 22px;
            margin-top: 10px;
            text-transform: uppercase;
        }
        .info-section {
            margin-bottom: 20px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }
        .info-item {
            margin-bottom: 10px;
        }
        .label {
            font-weight: bold;
            margin-right: 5px;
        }
        .prescriptions-section {
            margin-top: 30px;
            border-top: 1px solid #ddd;
            padding-top: 20px;
        }
        .prescriptions-title {
            font-size: 18px;
            margin-bottom: 15px;
            color: #2563eb;
        }
        .prescription-item {
            margin-bottom: 15px;
            padding: 10px;
            background-color: #f9f9f9;
            border-radius: 4px;
            border-left: 3px solid #2563eb;
        }
        .prescription-name {
            font-weight: bold;
            margin-bottom: 5px;
        }
        .prescription-details {
            margin-left: 15px;
        }
        .signature-section {
            margin-top: 60px;
            text-align: right;
            padding-top: 20px;
            border-top: 1px dashed #aaa;
        }
        .date-section {
            margin-top: 20px;
            text-align: right;
        }
        .footer {
            margin-top: 40px;
            font-size: 12px;
            text-align: center;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo"><img src="https://res.cloudinary.com/djdogxq0d/image/upload/v1744366688/logo_s5eufg.png" alt="CKDCARE" width="250" height="250"></div>
        <div class="title">Ordonnance Médicale</div>
    </div>

    <div class="info-section">
        <div class="info-grid">
            <div class="info-item">
                <span class="label">Patient:</span>
                <span>{{ $patient->nom }} {{ $patient->prenom }}</span>
            </div>
            <div class="info-item">
                <span class="label">Date de naissance:</span>
                <span>{{ date('d/m/Y', strtotime($patient->date_naissance)) }}</span>
            </div>
            <div class="info-item">
                <span class="label">N° Sécurité Sociale:</span>
                <span>{{ $patient->numero_secu }}</span>
            </div>
            <div class="info-item">
                <span class="label">Date de consultation:</span>
                <span>{{ date('d/m/Y', strtotime($visite->date)) }}</span>
            </div>
        </div>
    </div>

    <div class="prescriptions-section">
        <div class="prescriptions-title">Prescriptions</div>
        
        @if(!empty($prescriptions))
            @foreach($prescriptions as $prescription)
            <div class="prescription-item">
                <div class="prescription-name">{{ $prescription['medicament'] }}</div>
                <div class="prescription-details">
                    <div><span class="label">Posologie:</span> {{ $prescription['posologie'] }}</div>
                </div>
            </div>
            @endforeach
        @else
            <p>Aucune prescription pour cette consultation.</p>
        @endif
    </div>

    <div class="date-section">
        <div>Fait le {{ date('d/m/Y') }}</div>
    </div>

    <div class="signature-section">
        <div>Signature du médecin</div>
        <div style="height: 60px;"></div>
        <div>Dr. {{ $visite->medecin }}</div>
    </div>

    <div class="footer">
        <p>Cette ordonnance est valable pour une durée de 3 mois à compter de sa date d'émission, sauf mention contraire.</p>
        <p>CKDCare - Suivi et gestion des patients atteints d'insuffisance rénale chronique</p>
    </div>
</body>
</html>
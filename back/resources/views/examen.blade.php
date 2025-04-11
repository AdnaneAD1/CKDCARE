<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Demande d'Examen</title>
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
            font-size: 24px;
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
        .examens-section {
            margin-top: 30px;
            border-top: 1px solid #ddd;
            padding-top: 20px;
        }
        .examens-title {
            font-size: 18px;
            margin-bottom: 15px;
            color: #2563eb;
        }
        .examen-item {
            margin-bottom: 10px;
            padding: 8px;
            background-color: #f9f9f9;
            border-radius: 4px;
        }
        .results-section {
            margin-top: 40px;
            border: 1px dashed #aaa;
            padding: 15px;
            border-radius: 4px;
        }
        .results-title {
            text-align: center;
            font-size: 18px;
            margin-bottom: 15px;
            text-transform: uppercase;
        }
        .result-field {
            margin-bottom: 15px;
        }
        .signature-section {
            margin-top: 40px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        .signature-box {
            border-top: 1px solid #aaa;
            padding-top: 10px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo"><img src="https://res.cloudinary.com/djdogxq0d/image/upload/v1744366688/logo_s5eufg.png" alt="CKDCARE" width="150" height="150"></div>
        <div class="title">Demande d'Examens Médicaux</div>
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
                <span class="label">Date de la demande:</span>
                <span>{{ date('d/m/Y', strtotime($visite->date)) }}</span>
            </div>
            <div class="info-item">
                <span class="label">Médecin prescripteur:</span>
                <span>{{ $visite->medecin }}</span>
            </div>
            <div class="info-item">
                <span class="label">Motif de consultation:</span>
                <span>{{ $visite->motif }}</span>
            </div>
        </div>
    </div>

    @if(!empty($examens))
    <div class="examens-section">
        <div class="examens-title">Examens Cliniques</div>
        @foreach($examens as $examen)
        <div class="examen-item">
            <div><span class="label">Type:</span> {{ $examen['type'] }}</div>
        </div>
        @endforeach
    </div>
    @endif

    @if(!empty($biologie))
    <div class="examens-section">
        <div class="examens-title">Examens Biologiques</div>
        @foreach($biologie as $bio)
        <div class="examen-item">
            <div><span class="label">Type:</span> {{ $bio['type'] }}</div>
        </div>
        @endforeach
    </div>
    @endif

    <div class="results-section">
        <div class="results-title">Résultats (à remplir par le laboratoire)</div>
        
        <div class="result-field">
            <div class="label">Observations:</div>
            <div style="height: 100px; border: 1px solid #ddd; margin-top: 5px;"></div>
        </div>
        
        <div class="result-field">
            <div class="label">Résultats:</div>
            <div style="height: 150px; border: 1px solid #ddd; margin-top: 5px;"></div>
        </div>
    </div>

    <div class="signature-section">
        <div class="signature-box">
            <div>Signature du médecin</div>
            <div style="height: 60px;"></div>
            <div>{{ $visite->medecin }}</div>
        </div>
        <div class="signature-box">
            <div>Signature et cachet du laboratoire</div>
            <div style="height: 60px;"></div>
            <div>Nom: ______________________</div>
            <div>Lieu: ______________________</div>
            <div>Date: ______________________</div>
        </div>
    </div>
</body>
</html>
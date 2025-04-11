<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Patient extends Model
{
    use HasFactory;

    protected $fillable = [
        'numero_dossier',
        'medecin_id',
        'nom',
        'prenom',
        'date_naissance',
        'sexe',
        'adresse',
        'telephone',
        'email',
        'numero_secu',
        'medecin_referent',
        'stade',
        'antecedents',
        'traitements'
    ];

    protected $casts = [
        'antecedents' => 'array',
        'traitements' => 'array',
        'date_naissance' => 'date'
    ];

    public function visites()
    {
        return $this->hasMany(Visite::class);
    }

    public function dossier()
    {
        return $this->hasOne(Dossier::class);
    }

    public function medecin()
    {
        return $this->belongsTo(User::class, 'medecin_id');
    }

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($patient) {
            if (!$patient->numero_dossier) {
                // Générer un numéro de dossier unique : CKD-YYYYMMDD-XXX
                $date = now()->format('Ymd');
                $lastPatient = self::where('numero_dossier', 'like', "CKD-$date-%")
                    ->orderBy('numero_dossier', 'desc')
                    ->first();
                
                $sequence = $lastPatient 
                    ? (int)substr($lastPatient->numero_dossier, -3) + 1 
                    : 1;
                
                $patient->numero_dossier = sprintf("CKD-%s-%03d", $date, $sequence);
            }
        });

        // Créer automatiquement un dossier médical après la création du patient
        static::created(function ($patient) {
            $patient->dossier()->create([
                'numero_dossier' => $patient->numero_dossier,
                'status' => 'en_cours'
            ]);
        });
    }
}

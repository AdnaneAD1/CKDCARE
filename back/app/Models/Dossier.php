<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Dossier extends Model
{
    use HasFactory;

    protected $fillable = [
        'numero_dossier',
        'patient_id',
        'status',
        'documents'
    ];

    protected $casts = [
        'documents' => 'array'
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function visites()
    {
        return $this->hasMany(Visite::class, 'patient_id', 'patient_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Visite extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'date',
        'heure',
        'medecin',
        'motif',
        'status',
        'examens',
        'biologie',
        'prescriptions',
        'notes'
    ];

    protected $casts = [
        'examens' => 'array',
        'biologie' => 'array',
        'prescriptions' => 'array',
        'date' => 'date',
        'heure' => 'datetime:H:i'
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }
}

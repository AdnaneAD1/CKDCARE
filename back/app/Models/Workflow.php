<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Workflow extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom',
        'description',
        'stade',
        'examens_reguliers',
        'alertes',
        'medecin_id'
    ];

    protected $casts = [
        'examens_reguliers' => 'array',
        'alertes' => 'array'
    ];

    public function medecin()
    {
        return $this->belongsTo(User::class, 'medecin_id');
    }

    public function patients()
    {
        return $this->belongsToMany(Patient::class)
            ->withPivot('rappels')
            ->withTimestamps();
    }
}

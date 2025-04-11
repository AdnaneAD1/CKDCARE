<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Medecin extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'specialite',
        'preferences_notifications'
    ];

    protected $casts = [
        'preferences_notifications' => 'array'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function patients()
    {
        return $this->hasMany(Patient::class, 'medecin_id', 'user_id');
    }
}

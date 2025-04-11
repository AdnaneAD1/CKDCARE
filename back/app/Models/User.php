<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Models\Traits\HasMedecinRole;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasMedecinRole;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * Get the patients for the user.
     */
    public function patients()
    {
        return $this->hasMany(Patient::class, 'medecin_id');
    }

    /**
     * Get the medecin for the user.
     */
    public function medecin()
    {
        return $this->hasOne(Medecin::class);
    }

    /**
     * Check if the user is an admin.
     *
     * @return bool
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * The "booted" method of the model.
     *
     * @return void
     */
    protected static function boot()
    {
        parent::boot();

        // Créer automatiquement un profil médecin pour les utilisateurs avec le rôle médecin
        static::created(function ($user) {
            if ($user->role === 'medecin') {
                $user->medecin()->create([
                    'specialite' => 'Non spécifiée',
                    'preferences_notifications' => [
                        'email' => true,
                        'desktop' => true,
                        'urgent' => true
                    ]
                ]);
            }
        });
    }
}

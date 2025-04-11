<?php

namespace App\Models\Traits;

trait HasMedecinRole
{
    /**
     * Vérifie si l'utilisateur est un médecin.
     *
     * @return bool
     */
    public function isMedecin(): bool
    {
        return $this->role === 'medecin';
    }
}

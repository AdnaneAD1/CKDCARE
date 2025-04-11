<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class MedecinSeeder extends Seeder
{
    public function run()
    {
        // Créer un utilisateur avec le rôle médecin
        $user = User::create([
            'name' => 'Dr. Jean Dupont',
            'email' => 'jean.dupont@ckdcare.fr',
            'password' => Hash::make('password123'),
            'role' => 'medecin'
        ]);

        // Le profil médecin est créé automatiquement grâce au boot() dans le modèle User
        // Mais on peut mettre à jour ses informations
        $user->medecin()->update([
            'specialite' => 'Néphrologie',
            'preferences_notifications' => [
                'email' => true,
                'desktop' => true,
                'urgent' => true
            ]
        ]);

        $this->command->info('Médecin créé avec succès :');
        $this->command->info('Email: jean.dupont@ckdcare.fr');
        $this->command->info('Mot de passe: password123');
    }
}

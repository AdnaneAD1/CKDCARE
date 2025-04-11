# CKDCare - Plateforme de gestion des patients atteints de Maladie Rénale Chronique

![Logo CKDCare](https://res.cloudinary.com/djdogxq0d/image/upload/v1744366688/logo_s5eufg.png)

## 📋 Présentation

CKDCare est une plateforme médicale complète dédiée à la gestion et au suivi des patients atteints de Maladie Rénale Chronique (MRC). Cette application permet aux médecins et au personnel médical de suivre efficacement l'évolution des patients, de planifier des consultations, de gérer les dossiers médicaux et de communiquer avec les patients via des notifications automatisées.

## 🚀 Fonctionnalités principales

### Gestion des patients
- Création et gestion des dossiers patients
- Suivi des antécédents médicaux et des traitements
- Classification par stade de la maladie rénale
- Recherche et filtrage avancés des patients

### Gestion des consultations
- Planification des visites médicales
- Suivi des rendez-vous (planifiés, en cours, terminés, annulés)
- Génération automatique de documents médicaux (ordonnances, demandes d'examens)
- Historique complet des consultations par patient

### Communication avec les patients
- Notifications SMS automatiques pour les rendez-vous
- Envoi d'emails avec pièces jointes (ordonnances, demandes d'examens)
- Rappels de consultations

### Administration
- Gestion des utilisateurs (médecins, personnel administratif)
- Tableau de bord avec statistiques et indicateurs clés
- Rapports médicaux exportables

## 🛠️ Architecture technique

CKDCare est construit selon une architecture moderne en deux parties :

### Backend (API REST)
- **Framework** : Laravel 12
- **Base de données** : MySQL
- **Authentification** : Laravel Sanctum (API tokens)
- **Génération de PDF** : DomPDF
- **Notifications** : Twilio (SMS), Laravel Mail

### Frontend
- **Framework** : Next.js 13
- **UI/UX** : Tailwind CSS, Shadcn UI
- **Gestion d'état** : React Hooks, SWR pour les requêtes API
- **Authentification** : Gestion de sessions côté client

## 📦 Structure du projet

Le projet est organisé en deux dossiers principaux :

### `/back` - Backend Laravel
```
/app
  /Http
    /Controllers    # Contrôleurs de l'API
    /Middleware     # Middleware d'authentification et validation
  /Models           # Modèles de données
  /Services         # Services métier
/database
  /migrations       # Migrations de base de données
  /seeders          # Données de test
/resources
  /views            # Templates pour emails et PDF
/routes
  /api.php          # Définition des routes API
```

### `/project` - Frontend Next.js
```
/app
  /(auth)           # Pages d'authentification
  /(dashboard)      # Pages du tableau de bord
    /patients       # Gestion des patients
    /dossiers       # Gestion des dossiers médicaux
    /visites        # Gestion des consultations
    /admin          # Administration
/components         # Composants réutilisables
/hooks              # Hooks personnalisés
/lib                # Utilitaires et configuration
/public             # Ressources statiques
```

## 🔧 Installation et configuration

### Prérequis
- PHP 8.2 ou supérieur
- Composer
- Node.js 18 ou supérieur
- MySQL 8.0 ou supérieur

### Installation du backend
```bash
# Cloner le dépôt
git clone https://github.com/AdnaneAD1/CKDCARE.git
cd ckdcare/back

# Installer les dépendances
composer install

# Configurer l'environnement
cp .env.example .env
php artisan key:generate

# Configurer la base de données dans .env
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=ckdcare
# DB_USERNAME=root
# DB_PASSWORD=

# Configurer les services externes dans .env
# TWILIO_SID=votre_sid
# TWILIO_AUTH_TOKEN=votre_token
# TWILIO_PHONE_NUMBER=votre_numero

# MAIL_MAILER=smtp
# MAIL_HOST=votre_host
# MAIL_PORT=2525
# MAIL_USERNAME=votre_username
# MAIL_PASSWORD=votre_password
# MAIL_FROM_ADDRESS=service@ckdcare.fr

# Migrations et seeders
php artisan migrate --seed

# Démarrer le serveur
php artisan serve

# Identifiant par défaut
Nom d'utilisateur: jean.dupont@ckdcare.fr
Mot de passe: password123
```

### Installation du frontend
```bash
# Dans un autre terminal
cd ckdcare/project

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

## 🔐 Authentification et sécurité

CKDCare utilise Laravel Sanctum pour l'authentification API et la gestion des sessions. Le système prend en charge différents rôles d'utilisateurs :

- **Administrateur** : Accès complet à toutes les fonctionnalités
- **Médecin** : Accès aux dossiers de ses patients et à la gestion des consultations
- **Assistant** : Accès limité pour la gestion des rendez-vous et l'enregistrement des patients

## 📱 Notifications et communications

### Notifications SMS
Le système utilise Twilio pour envoyer des SMS aux patients pour :
- Confirmation de rendez-vous
- Rappels de consultations
- Informations importantes

### Emails automatisés
Des emails sont envoyés automatiquement avec :
- Détails des consultations
- Documents médicaux en pièces jointes (PDF)
- Instructions pour les patients

## 📊 Rapports et analyses

CKDCare offre plusieurs types de rapports :
- Évolution des patients par stade de MRC
- Statistiques de consultations
- Rapports médicaux individuels
- Analyses de tendances

## 🔄 Flux de travail typique

1. **Enregistrement d'un patient**
   - Création du dossier avec informations personnelles
   - Saisie des antécédents et traitements
   - Classification du stade de MRC

2. **Planification d'une consultation**
   - Sélection du patient et du médecin
   - Définition de la date, heure et motif
   - Notification automatique au patient (SMS + email)

3. **Pendant la consultation**
   - Mise à jour du statut (en cours)
   - Saisie des observations médicales
   - Prescription d'examens ou de médicaments

4. **Après la consultation**
   - Génération des documents (ordonnances, demandes d'examens)
   - Envoi automatique par email au patient
   - Planification du suivi

## 🛣️ Feuille de route

Fonctionnalités prévues pour les prochaines versions :

- **Application mobile** pour les patients
- **Intégration de l'IA** pour l'aide au diagnostic
- **Téléconsultation** intégrée
- **Interopérabilité** avec d'autres systèmes médicaux
- **Notifications push** pour les médecins

## 👥 Équipe et contributions

CKDCare est développé par une équipe de développeurs formé pour l'hackathon AI4CKD pour l'amélioration des soins de santé grâce à la technologie.


---

© 2025 CKDCare - Tous droits réservés

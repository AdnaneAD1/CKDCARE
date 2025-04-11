<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\VisiteController;
use App\Http\Controllers\DossierController;
use App\Http\Controllers\MedecinController;
use App\Http\Controllers\WorkflowController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AdminController;

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

Route::middleware('auth:sanctum')->group(function () {
    // Routes pour les patients
    Route::post('/patients', [PatientController::class, 'store']);
    Route::get('/patients', [PatientController::class, 'index']);
    Route::get('/patients/all', [PatientController::class, 'getAllPatients']);
    Route::get('/patients/{id}', [PatientController::class, 'show']);
    Route::put('/patients/{id}', [PatientController::class, 'update']);
    Route::delete('/patients/{id}', [PatientController::class, 'destroy']);

    // Routes pour les visites
    Route::post('/visites', [VisiteController::class, 'store']);
    Route::get('/visites/{id}', [VisiteController::class, 'show']);
    Route::put('/visites/{id}', [VisiteController::class, 'update']);
    Route::get('/patients/{patientId}/visites', [VisiteController::class, 'getVisitesPatient']);

    // Routes pour les dossiers
    Route::get('/dossiers', [DossierController::class, 'index']);
    Route::get('/dossiers/search', [DossierController::class, 'search']);
    Route::get('/dossiers/{id}', [DossierController::class, 'show']);
    Route::put('/dossiers/{id}', [DossierController::class, 'update']);
    Route::patch('/dossiers/{id}/status', [DossierController::class, 'updateStatus']);

    // Routes pour le profil médecin
    Route::get('/medecin/profile', [MedecinController::class, 'show']);
    Route::put('/medecin/profile', [MedecinController::class, 'update']);
    Route::put('/medecin/password', [MedecinController::class, 'updatePassword']);

    // Routes pour les workflows
    Route::get('/workflows', [WorkflowController::class, 'index']);
    Route::post('/workflows', [WorkflowController::class, 'store']);
    Route::get('/workflows/{id}', [WorkflowController::class, 'show']);
    Route::put('/workflows/{id}', [WorkflowController::class, 'update']);
    Route::delete('/workflows/{id}', [WorkflowController::class, 'destroy']);
    Route::post('/workflows/{id}/assign', [WorkflowController::class, 'assignToPatient']);
    
    // Route pour le dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);
    
    // Routes pour l'administration des médecins (réservées aux administrateurs)
    Route::prefix('admin')->group(function () {
        Route::get('/medecins', [AdminController::class, 'listMedecins']);
        Route::post('/medecins', [AdminController::class, 'addMedecin']);
        Route::put('/medecins/{id}', [AdminController::class, 'updateMedecin']);
        Route::delete('/medecins/{id}', [AdminController::class, 'deleteMedecin']);
        Route::put('/medecins/{id}/password', [AdminController::class, 'updateMedecinPassword']);
    });
});

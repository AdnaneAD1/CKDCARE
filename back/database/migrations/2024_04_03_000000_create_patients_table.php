<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('patients', function (Blueprint $table) {
            $table->id();
            $table->string('numero_dossier')->unique();
            $table->foreignId('medecin_id')->constrained('users')->onDelete('cascade');
            $table->string('nom');
            $table->string('prenom');
            $table->date('date_naissance');
            $table->enum('sexe', ['M', 'F']);
            $table->string('adresse')->nullable();
            $table->string('telephone')->nullable();
            $table->string('numero_secu')->unique();
            $table->string('medecin_referent')->nullable();
            $table->string('stade')->nullable();
            $table->json('antecedents')->nullable();
            $table->json('traitements')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('patients');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('visites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->onDelete('cascade');
            $table->date('date');
            $table->time('heure');
            $table->string('medecin');
            $table->string('motif');
            $table->enum('status', ['planifié', 'en_cours', 'terminé', 'annulé']);
            $table->json('examens')->nullable();
            $table->json('biologie')->nullable();
            $table->json('prescriptions')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('visites');
    }
};

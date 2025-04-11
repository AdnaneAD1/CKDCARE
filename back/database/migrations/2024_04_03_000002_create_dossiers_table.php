<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('dossiers', function (Blueprint $table) {
            $table->id();
            $table->string('numero_dossier')->unique();
            $table->foreignId('patient_id')->constrained()->onDelete('cascade');
            $table->enum('status', ['en_cours', 'urgent', 'stable'])->default('en_cours');
            $table->json('documents')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('dossiers');
    }
};

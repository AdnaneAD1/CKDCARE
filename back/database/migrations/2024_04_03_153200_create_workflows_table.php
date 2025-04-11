<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('workflows', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->text('description')->nullable();
            $table->string('stade');
            $table->json('examens_reguliers');
            $table->json('alertes');
            $table->foreignId('medecin_id')->constrained('users');
            $table->timestamps();
        });

        Schema::create('patient_workflow', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->onDelete('cascade');
            $table->foreignId('workflow_id')->constrained()->onDelete('cascade');
            $table->json('rappels');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('patient_workflow');
        Schema::dropIfExists('workflows');
    }
};

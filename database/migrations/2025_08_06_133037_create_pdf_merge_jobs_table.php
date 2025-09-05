<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('pdf_merge_jobs', function (Blueprint $table) {
            $table->id();
            $table->json('input_urls');
            $table->string('status')->default('pending');
            $table->text('result_url')->nullable();
            $table->string('cloudconvert_job_id')->nullable();
            $table->timestamps();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pdf_merge_jobs');
    }
};

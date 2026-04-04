<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notes', function (Blueprint $table) {
            $table->id();
            $table->string('title', 200);
            $table->longText('original_content');
            $table->longText('summary')->nullable();
            $table->timestamps();
            
            // For search performance
            // $table->fullText(['title', 'original_content', 'summary']); // Commented out for SQLite
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notes');
    }
};
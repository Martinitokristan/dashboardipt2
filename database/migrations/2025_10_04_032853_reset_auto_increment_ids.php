<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Reset auto increment IDs to start from 1
        DB::statement('ALTER TABLE departments AUTO_INCREMENT = 1');
        DB::statement('ALTER TABLE courses AUTO_INCREMENT = 1');
        DB::statement('ALTER TABLE academic_years AUTO_INCREMENT = 1');
        DB::statement('ALTER TABLE student_profiles AUTO_INCREMENT = 1');
        DB::statement('ALTER TABLE faculty_profiles AUTO_INCREMENT = 1');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration cannot be easily reversed
        // Auto increment values will continue from where they left off
    }
};
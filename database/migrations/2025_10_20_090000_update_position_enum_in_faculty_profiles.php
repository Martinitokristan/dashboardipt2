<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // Update the position column to include 'Department Head'
        DB::statement("ALTER TABLE `faculty_profiles` MODIFY COLUMN `position` ENUM('Dean', 'Instructor', 'Part-time', 'Department Head') NULL");
    }

    public function down(): void
    {
        // Revert back to original enum values
        DB::statement("ALTER TABLE `faculty_profiles` MODIFY COLUMN `position` ENUM('Dean', 'Instructor', 'Part-time') NULL");
    }
};

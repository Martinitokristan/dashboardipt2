<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        Schema::table('departments', function (Blueprint $table) {
            if (Schema::hasColumn('departments', 'department_head_id')) {
                try {
                    DB::statement('ALTER TABLE departments DROP FOREIGN KEY departments_department_head_id_foreign');
                } catch (\Exception $e) {
                    // Ignore if the foreign key doesn't exist
                }

                $table->dropColumn('department_head_id');
            }
        });
    }

    public function down()
    {
        Schema::table('departments', function (Blueprint $table) {
            if (!Schema::hasColumn('departments', 'department_head_id')) {
                $table->foreignId('department_head_id')
                    ->nullable()
                    ->constrained('faculty_profiles', 'faculty_id')
                    ->nullOnDelete();
            }
        });
    }
};
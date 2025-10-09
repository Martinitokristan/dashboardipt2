<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('student_profiles', function (Blueprint $table) {
            // Only add year_level, as academic_year_id and deleted_at are already present
            if (!Schema::hasColumn('student_profiles', 'year_level')) {
                $table->string('year_level', 1)->nullable()->after('course_id');
            }
        });
    }

    public function down()
    {
        Schema::table('student_profiles', function (Blueprint $table) {
            if (Schema::hasColumn('student_profiles', 'year_level')) {
                $table->dropColumn('year_level');
            }
        });
    }
};
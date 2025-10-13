<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class ModifyYearLevelColumnInStudentProfilesTable extends Migration
{
    public function up()
    {
        Schema::table('student_profiles', function (Blueprint $table) {
            $table->string('year_level', 3)->change();
        });
    }

    public function down()
    {
        Schema::table('student_profiles', function (Blueprint $table) {
            $table->string('year_level', 1)->change();
        });
    }
}
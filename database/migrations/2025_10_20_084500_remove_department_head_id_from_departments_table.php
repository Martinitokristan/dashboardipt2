<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('departments', function (Blueprint $table) {
            if (Schema::hasColumn('departments', 'department_head_id')) {
                $table->dropForeign(['department_head_id']);
                $table->dropColumn('department_head_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('departments', function (Blueprint $table) {
            $table->foreignId('department_head_id')->nullable()->constrained('faculty_profiles', 'faculty_id')->after('department_name');
        });
    }
};

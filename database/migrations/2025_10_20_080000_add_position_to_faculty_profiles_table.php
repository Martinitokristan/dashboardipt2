<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('faculty_profiles', function (Blueprint $table) {
            $table->enum('position', ['Dean', 'Instructor', 'Part-time'])->nullable()->after('address');
        });
    }

    public function down(): void
    {
        Schema::table('faculty_profiles', function (Blueprint $table) {
            $table->dropColumn('position');
        });
    }
};

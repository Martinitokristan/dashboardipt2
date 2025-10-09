<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('faculty_profiles', function (Blueprint $table) {
            
            if (Schema::hasColumn('faculty_profiles', 'deleted_at')) {
                $table->dropColumn('deleted_at');
            }
            
            if (!Schema::hasColumn('faculty_profiles', 'archived_at')) {
                $table->timestamp('archived_at')->nullable()->after('updated_at');
            }
        });
    }

    public function down()
    {
        Schema::table('faculty_profiles', function (Blueprint $table) {
            $table->dropColumn('archived_at');
            $table->softDeletes();
        });
    }
};
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('faculty_profiles', function (Blueprint $table) {
            $table->id('faculty_id');
            $table->string('f_name');
            $table->string('m_name')->nullable();
            $table->string('l_name');
            $table->string('suffix')->nullable();
            $table->date('date_of_birth');
            $table->enum('sex', ['male', 'female', 'other']);
            $table->string('phone_number');
            $table->string('email_address');
            $table->text('address');
            $table->enum('status', ['active', 'inactive', 'graduated', 'dropped'])->default('active');
            $table->foreignId('department_id')->constrained('departments', 'department_id');
            $table->timestamps();
            $table->timestamp('archived_at')->nullable();
            $table->softDeletes();
        });
    }

    public function down()
    {
        Schema::dropIfExists('faculty_profiles');
    }
};

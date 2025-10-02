<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('courses', function (Blueprint $table) {
            $table->id('course_id');
            $table->string('course_name');
            $table->enum('course_status', ['active', 'inactive'])->default('active');
            $table->unsignedBigInteger('department_id')->nullable();
            $table->timestamps();
            $table->timestamp('archived_at')->nullable();
            $table->foreign('department_id')->references('department_id')->on('departments')->nullOnDelete();
        });
    }

    public function down()
    {
        Schema::dropIfExists('courses');
    }
};

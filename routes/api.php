<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\DepartmentController;
use App\Http\Controllers\Admin\CourseController;
use App\Http\Controllers\Admin\AcademicYearController;
use App\Http\Controllers\Admin\ArchiveController;
use App\Http\Controllers\Admin\StudentController;
use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\FacultyController;
use App\Http\Controllers\Admin\ReportController;

Route::middleware(['auth:sanctum', 'api.role:admin'])->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Dashboard and Profile endpoints
    Route::get('/dashboard', [AdminController::class, 'dashboardJson']);
    Route::get('/profile', [AdminController::class, 'getProfile']);
    Route::put('/profile', [AdminController::class, 'updateProfile']);
    Route::post('/logout', [AdminController::class, 'logout']);

    Route::prefix('admin')->group(function () {
        // Department API Resource
        Route::apiResource('departments', DepartmentController::class)->only(['index', 'store', 'show', 'update']);
        Route::post('/departments/{department}/delete', [DepartmentController::class, 'softDelete']);
        Route::post('/departments/{department}/restore', [DepartmentController::class, 'restore']);

        // Course API Resource
        Route::apiResource('courses', CourseController::class)->only(['index', 'store', 'show', 'update']);
        Route::post('/courses/{course}/delete', [CourseController::class, 'softDelete']);
        Route::post('/courses/{course}/restore', [CourseController::class, 'restore']);

        // Academic Year API Resource
        Route::apiResource('academic-years', AcademicYearController::class)->only(['index', 'store', 'show', 'update']);
        Route::post('/academic-years/{academic_year}/delete', [AcademicYearController::class, 'softDelete']);
        Route::post('/academic-years/{academic_year}/restore', [AcademicYearController::class, 'restore']);

        // Student API Resource
        Route::apiResource('students', StudentController::class)->only(['index', 'store', 'show', 'update']);
        Route::post('/students/{student}/archive', [StudentController::class, 'archive']);
        Route::post('/students/{student}/restore', [StudentController::class, 'restore']);

        // Faculty API Resource
        Route::apiResource('faculty', FacultyController::class)->only(['index', 'store', 'show', 'update']);
        Route::post('/faculty/{faculty}/archive', [FacultyController::class, 'archive']);
        Route::post('/faculty/{faculty}/restore', [FacultyController::class, 'restore']);

        // Reports API Resource
        Route::apiResource('reports', ReportController::class)->only(['index']);
        Route::post('/reports/students', [ReportController::class, 'generateStudentReport']);
        Route::post('/reports/faculty', [ReportController::class, 'generateFacultyReport']);

        // Archived items
        Route::get('/archived', [ArchiveController::class, 'index']);
    });
});
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

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Dashboard and Profile endpoints
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboardJson']);
    Route::get('/profile', [AdminController::class, 'getProfile']);
    Route::put('/profile', [AdminController::class, 'updateProfile']);
    Route::post('/logout', [AdminController::class, 'logout']);

    Route::prefix('admin')->group(function () {
        // Department API Resource
        Route::apiResource('departments', DepartmentController::class)->only(['index', 'store', 'show', 'update']);
        Route::post('/departments/{department}/archive', [DepartmentController::class, 'archive']);
        Route::post('/departments/{department}/restore', [DepartmentController::class, 'restore']);
        Route::delete('/departments/{department}', [DepartmentController::class, 'destroy']);

        // Course API Resource
        Route::apiResource('courses', CourseController::class)->only(['index', 'store', 'show', 'update']);
        Route::post('/courses/{course}/archive', [CourseController::class, 'archive']);
        Route::post('/courses/{course}/restore', [CourseController::class, 'restore']);
        Route::delete('/courses/{course}', [CourseController::class, 'destroy']);

        // Academic Year API Resource
        Route::apiResource('academic-years', AcademicYearController::class)->only(['index', 'store', 'show', 'update']);
        Route::post('/academic-years/{academic_year}/archive', [AcademicYearController::class, 'archive']);
        Route::post('/academic-years/{academic_year}/restore', [AcademicYearController::class, 'restore']);
        Route::delete('/academic-years/{academic_year}', [AcademicYearController::class, 'destroy']);

        // Student API Resource
        Route::apiResource('students', StudentController::class)->only(['index', 'store', 'show', 'update']);
        Route::post('/students/{student}/archive', [StudentController::class, 'archive']);
        Route::post('/students/{student}/restore', [StudentController::class, 'restore']);
        Route::delete('/students/{student}', [StudentController::class, 'destroy']);

        // Faculty API Resource
        Route::apiResource('faculty', FacultyController::class)->only(['index', 'store', 'show', 'update']);
        Route::post('/faculty/{faculty}/archive', [FacultyController::class, 'archive']);
        Route::post('/faculty/{faculty}/restore', [FacultyController::class, 'restore']);
        Route::delete('/faculty/{faculty}', [FacultyController::class, 'destroy']);

        // Reports API Resource
        Route::apiResource('reports', ReportController::class)->only(['index']);
        Route::post('/reports/students', [ReportController::class, 'generateStudentReport']);
        Route::post('/reports/faculty', [ReportController::class, 'generateFacultyReport']);

        // Archived items
        Route::get('/archived', [ArchiveController::class, 'index']);
    });
});
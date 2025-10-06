<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\SystemSettingsController;
use App\Http\Controllers\Admin\DepartmentController;
use App\Http\Controllers\Admin\CourseController;
use App\Http\Controllers\Admin\AcademicYearController;
use App\Http\Controllers\Admin\ArchiveController;
use App\Http\Controllers\Admin\StudentController;
use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\FacultyController;
use App\Http\Controllers\Admin\ReportController;
// API-only; SPA JSON endpoints are handled in routes/web.php for session auth

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

Route::middleware(['auth:sanctum', 'api.role:admin'])->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Dashboard and Profile endpoints
    Route::get('/dashboard/stats', [AdminController::class, 'getDashboardStats']);
    Route::get('/profile', [AdminController::class, 'getProfile']);
    Route::put('/profile', [AdminController::class, 'updateProfileJson']);
    Route::post('/logout', [AdminController::class, 'logout']);

    Route::prefix('admin')->group(function () {
        // Department API Resource
        Route::apiResource('departments', DepartmentController::class)->only([
            'index', 'store', 'show', 'update'
        ]);
        Route::post('/departments/{department}/archive', [DepartmentController::class, 'archive']);
        Route::post('/departments/{department}/unarchive', [DepartmentController::class, 'unarchive']);

        // Course API Resource
        Route::apiResource('courses', CourseController::class)->only([
            'index', 'store', 'show', 'update'
        ]);
        Route::post('/courses/{course}/archive', [CourseController::class, 'archive']);
        Route::post('/courses/{course}/unarchive', [CourseController::class, 'unarchive']);

        // Academic Year API Resource
        Route::apiResource('academic-years', AcademicYearController::class)->only([
            'index', 'store', 'show', 'update'
        ]);

        // Archive API Resource
        Route::apiResource('archived', ArchiveController::class)->only(['index']);

        // Student API Resource
        Route::apiResource('students', StudentController::class)->only([
            'index', 'store', 'show', 'update'
        ]);

        // Faculty API Resource
        Route::apiResource('faculty', FacultyController::class)->only([
            'index', 'store', 'show', 'update'
        ]);

        // Reports API Resource
        Route::apiResource('reports', ReportController::class)->only(['index']);
        Route::post('/reports/students', [ReportController::class, 'generateStudentReport']);
        Route::post('/reports/faculty', [ReportController::class, 'generateFacultyReport']);
    });
});

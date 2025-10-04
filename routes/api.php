<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\SystemSettingsController;
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

Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Dashboard and Profile endpoints
    Route::get('/dashboard/stats', [AdminController::class, 'getDashboardStats']);
    Route::put('/profile', [AdminController::class, 'updateProfileJson']);

    Route::prefix('admin')->group(function () {
        // Department API Resource
        Route::apiResource('departments', SystemSettingsController::class)->only([
            'index', 'store', 'show', 'update'
        ]);
        Route::post('/departments/{department}/archive', [SystemSettingsController::class, 'archiveDepartmentJson']);
        Route::post('/departments/{department}/unarchive', [SystemSettingsController::class, 'unarchiveDepartmentJson']);

        // Course API Resource
        Route::apiResource('courses', SystemSettingsController::class)->only([
            'index', 'store', 'show', 'update'
        ]);
        Route::post('/courses/{course}/archive', [SystemSettingsController::class, 'archiveCourseJson']);
        Route::post('/courses/{course}/unarchive', [SystemSettingsController::class, 'unarchiveCourseJson']);

        // Academic Year API Resource
        Route::apiResource('academic-years', SystemSettingsController::class)->only([
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

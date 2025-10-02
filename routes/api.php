<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\SystemSettingsController;
use App\Http\Controllers\Admin\ArchiveController;
use App\Http\Controllers\Admin\StudentController;
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

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::prefix('admin')->group(function () {
        Route::get('/departments', [SystemSettingsController::class, 'departmentsIndexJson']);
        Route::post('/departments', [SystemSettingsController::class, 'storeDepartmentJson']);
        Route::put('/departments/{department}', [SystemSettingsController::class, 'updateDepartmentJson']);
        Route::post('/departments/{department}/archive', [SystemSettingsController::class, 'archiveDepartmentJson']);
        Route::post('/departments/{department}/unarchive', [SystemSettingsController::class, 'unarchiveDepartmentJson']);

        Route::get('/courses', [SystemSettingsController::class, 'coursesIndexJson']);
        Route::post('/courses', [SystemSettingsController::class, 'storeCourseJson']);
        Route::put('/courses/{course}', [SystemSettingsController::class, 'updateCourseJson']);
        Route::post('/courses/{course}/archive', [SystemSettingsController::class, 'archiveCourseJson']);
        Route::post('/courses/{course}/unarchive', [SystemSettingsController::class, 'unarchiveCourseJson']);

        Route::get('/academic-years', [SystemSettingsController::class, 'academicYearsIndexJson']);
        Route::post('/academic-years', [SystemSettingsController::class, 'storeAcademicYearJson']);
        Route::put('/academic-years/{academicYear}', [SystemSettingsController::class, 'updateAcademicYearJson']);
        Route::get('/archived', [ArchiveController::class, 'index']);

        // Students JSON
        Route::get('/students', [StudentController::class, 'indexJson']);
        Route::post('/students', [StudentController::class, 'storeJson']);
        Route::put('/students/{student}', [StudentController::class, 'updateJson']);
    });
});

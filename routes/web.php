<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Admin\AdminController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

// Auth routes
Route::get('/', [LoginController::class, 'showLoginForm'])->name('login');
Route::get('/login', [LoginController::class, 'showLoginForm']);
Route::post('/login', [LoginController::class, 'login'])->name('login.attempt');
Route::post('/logout', [LoginController::class, 'logout'])->name('logout');

// Protected SPA routes - require authentication and admin role
Route::middleware(['auth', 'role:admin'])->group(function () {
    Route::view('/dashboard', 'dashboard')->name('dashboard');
    Route::view('/settings', 'dashboard')->name('settings');
    Route::view('/students', 'dashboard')->name('students');
    Route::view('/faculty', 'dashboard')->name('faculty');
    Route::view('/reports', 'dashboard')->name('reports');
    Route::view('/profile', 'dashboard')->name('profile');
    Route::view('/archived', 'dashboard')->name('archived');

    // Settings subpaths
    Route::view('/settings/departments', 'dashboard')->name('settings.departments');
    Route::view('/settings/courses', 'dashboard')->name('settings.courses');
    Route::view('/settings/academic-years', 'dashboard')->name('settings.academic-years');

    // Catch-all for SPA
    Route::get('/{any}', [AdminController::class, 'dashboard'])->where('any', '^(?!api/).*$');
});
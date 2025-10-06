<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Admin\SystemSettingsController;
use App\Http\Controllers\Admin\ArchiveController;
use Illuminate\Support\Facades\Auth;

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

// Protected routes - require authentication and admin role
Route::middleware(['auth', 'role:admin'])->group(function () {
    Route::get('/dashboard', function () {
        return view('dashboard');
    })->name('dashboard');
    
    // Settings routes - require authentication and admin role
    Route::get('/settings', function () {
        return view('dashboard');
    })->name('settings');
    
    Route::get('/settings/departments', function () {
        return view('dashboard');
    })->name('settings.departments');
    
    Route::get('/settings/courses', function () {
        return view('dashboard');
    })->name('settings.courses');
    
    Route::get('/settings/academic-years', function () {
        return view('dashboard');
    })->name('settings.academic-years');
});

// SPA catch-all: if authenticated, serve dashboard shell, otherwise login shell
Route::get('/{any}', function () {
    if (!Auth::check()) {
        return view('login');
    }
    
    // Check if user is admin
    if (!Auth::user()->isAdmin()) {
        Auth::logout();
        return view('login')->with('error', 'Unauthorized access. Admin only.');
    }
    
    return view('dashboard');
})->where('any', '^(?!api/|dashboard|settings).*$');


// Admin JSON endpoints are now in routes/api.php with auth:sanctum



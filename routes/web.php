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

// SPA catch-all: if authenticated, serve dashboard shell, otherwise login shell
Route::get('/{any}', function () {
    return Auth::check() ? view('dashboard') : view('login');
})->where('any', '^(?!api).*$');


// Admin JSON endpoints are now in routes/api.php with auth:sanctum



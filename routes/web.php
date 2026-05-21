<?php

use App\Http\Controllers\AIController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CvController;

Route::inertia('/', 'welcome')->name('home');
Route::inertia('/about', 'about')->name('about');
Route::inertia('/contact', 'contact')->name('contact');

Route::middleware('guest')->group(function () {
    Route::inertia('/register', 'register')->name('register');
    Route::inertia('/login', 'login')->name('login');
});

Route::middleware('auth')->group(function () {
    Route::inertia('/dashboard', 'dashboard')->name('dashboard');
    Route::inertia('/chat', 'chat')->name('chat');
    Route::inertia('/settings', 'settings')->name('settings');
    Route::inertia('/profile', 'profile')->name('profile');
    Route::get('/cv/{id}', [CvController::class, 'display']);
});


Route::post('/api/login', [AuthController::class, 'login']);
Route::post('/api/register', [AuthController::class, 'register']);
Route::post('/api/logout', [AuthController::class, 'logout']);
Route::get('/api/me', [AuthController::class, 'me']);
Route::put('/api/profile', [AuthController::class, 'update_profile']);

Route::post('/api/ai/text', [AIController::class, 'text']);
Route::post('/api/ai/analyze', [AIController::class, 'analyze']);
Route::post('/api/ai/transcribe', [AIController::class, 'transcribe']);

Route::get('/api/cvs', [CvController::class, 'index']);
Route::get('/api/cvs/{id}', [CvController::class, 'show']);
Route::delete('/api/cvs/{id}', [CvController::class, 'destroy']);



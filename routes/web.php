<?php

use App\Http\Controllers\NoteController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\ChatController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;

// Home page
Route::get('/', function () {
    return view('index');
})->name('home');

// Health check
Route::get('/health', function () {
    try {
        DB::connection()->getPdo();
        $dbStatus = 'connected';
    } catch (\Exception $e) {
        $dbStatus = 'disconnected';
    }

    return response()->json([
        'status' => 'healthy',
        'database' => $dbStatus
    ]);
});

// API Routes
Route::prefix('api')->group(function () {
    
    // Notes
    Route::post('/summarize', [NoteController::class, 'summarize']);
    Route::post('/notes', [NoteController::class, 'store']);
    Route::get('/notes', [NoteController::class, 'index'] );
    Route::get('/notes/{note}', [NoteController::class, 'show']);
    Route::delete('/notes/{note}', [NoteController::class, 'destroy']);
    
    // Chat
    Route::post('/notes/{note}/chat', [ChatController::class, 'send']);
    Route::get('/notes/{note}/chat', [ChatController::class, 'history']);
    
    // Tags
    Route::get('/tags', [TagController::class, 'index']);
    Route::post('/tags', [TagController::class, 'store']);
    Route::post('/notes/{note}/tags', [TagController::class, 'attach']);
    Route::delete('/notes/{note}/tags/{tag}', [TagController::class, 'detach']);
});
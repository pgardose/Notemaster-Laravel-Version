<?php

use App\Http\Controllers\QuizController;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;

// ── Home ──────────────────────────────────────────────────────
Route::get('/', function () {
    return view('index');
})->name('home');

// ── Auth routes (guests only) ─────────────────────────────────
Route::middleware('guest')->group(function () {
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register']);
    Route::get('/login',    [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login',   [AuthController::class, 'login']);
});

Route::post('/logout', [AuthController::class, 'logout'])
    ->middleware('auth')
    ->name('logout');

// ── Health check ──────────────────────────────────────────────
Route::get('/health', function () {
    try {
        DB::connection()->getPdo();
        $dbStatus = 'connected';
    } catch (\Exception $e) {
        $dbStatus = 'disconnected';
    }
    return response()->json(['status' => 'healthy', 'database' => $dbStatus]);
});

// ── API Routes (web middleware so session/Auth::check() works) ─
Route::prefix('api')->middleware('web')->group(function () {

// TEMP DEBUG — remove before presentation
Route::get('/debug-quiz/{note}', function ($noteId) {
    $note = \App\Models\Note::findOrFail($noteId);
    $controller = new \App\Http\Controllers\QuizController();
    // Call generate and return raw response
    return $controller->generate($note);
})->middleware('auth');

    Route::post('/notes/{note}/quiz', [QuizController::class, 'generate']);

    // Summarize (guests get summary only, auth users get it saved)
    Route::post('/summarize', [NoteController::class, 'summarize']);

    // Guest chat (stateless, no note_id)
    Route::post('/guest-chat', [ChatController::class, 'guestChat']);

    // Tags
    Route::get('/tags',  [TagController::class, 'index']);
    Route::post('/tags', [TagController::class, 'store']);

    // Notes
    Route::get('/notes',          [NoteController::class, 'index']);
    Route::get('/notes/{note}',   [NoteController::class, 'show']);
    Route::delete('/notes/{note}', [NoteController::class, 'destroy']);

    // Chat
    Route::post('/notes/{note}/chat', [ChatController::class, 'send']);
    Route::get('/notes/{note}/chat',  [ChatController::class, 'history']);

    // Tags on notes
    Route::post('/notes/{note}/tags',          [TagController::class, 'attach']);
    Route::delete('/notes/{note}/tags/{tag}',  [TagController::class, 'detach']);

    Route::get('/api/debug-auth', function () {
    return response()->json([
        'auth_check' => Auth::check(),
        'auth_id'    => Auth::id(),
        'session_id' => session()->getId(),
        'user'       => Auth::user()?->only('id', 'email'),
    ]);
});
});
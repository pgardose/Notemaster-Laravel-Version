<?php

namespace App\Http\Controllers;

use App\Models\Note;
use App\Models\Message;
use App\Services\AiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChatController extends Controller
{
    protected $aiService;

    public function __construct(AiService $aiService)
    {
        $this->aiService = $aiService;
    }

    /**
     * POST /api/notes/{note}/chat
     * For logged-in users: saves messages to DB
     * Guest chat is handled client-side (no note_id available for guests)
     */
    public function send(Request $request, Note $note)
    {
        // Only the note's owner can chat with it
        if (!Auth::check() || $note->user_id !== Auth::id()) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'question' => 'required|string|max:1000',
        ]);

        // Save user message
        $userMessage = Message::create([
            'note_id' => $note->id,
            'role'    => 'user',
            'content' => $validated['question'],
        ]);

        // Get chat history for context
        $chatHistory = $note->messages()
            ->where('id', '<', $userMessage->id)
            ->get()
            ->map(fn($msg) => ['role' => $msg->role, 'content' => $msg->content])
            ->toArray();

        // Generate AI response
        $aiResponse = $this->aiService->generateChatResponse(
            $note->original_content,
            $note->summary,
            $chatHistory,
            $validated['question']
        );

        // Save AI message
        Message::create([
            'note_id' => $note->id,
            'role'    => 'assistant',
            'content' => $aiResponse,
        ]);

        return response()->json(['response' => $aiResponse]);
    }

    /**
     * POST /api/guest-chat
     * Stateless chat for guests — no DB, just AI response
     */
    public function guestChat(Request $request)
    {
        $validated = $request->validate([
            'question'    => 'required|string|max:1000',
            'note_text'   => 'required|string|max:50000',
            'summary'     => 'nullable|string',
            'history'     => 'nullable|array',
        ]);

        $aiResponse = $this->aiService->generateChatResponse(
            $validated['note_text'],
            $validated['summary'] ?? '',
            $validated['history'] ?? [],
            $validated['question']
        );

        return response()->json(['response' => $aiResponse]);
    }

    /**
     * GET /api/notes/{note}/chat
     */
    public function history(Note $note)
    {
        if (!Auth::check() || $note->user_id !== Auth::id()) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $messages = $note->messages()->orderBy('id')->get();
        return response()->json(['messages' => $messages]);
    }
}
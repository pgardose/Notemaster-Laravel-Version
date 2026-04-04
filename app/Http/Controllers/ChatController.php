<?php

namespace App\Http\Controllers;

use App\Models\Note;
use App\Models\Message;
use App\Services\AiService;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    protected $aiService;

    public function __construct(AiService $aiService)
    {
        $this->aiService = $aiService;
    }

    /**
     * POST /api/notes/{note}/chat
     */
    public function send(Request $request, Note $note)
    {
        $validated = $request->validate([
            'question' => 'required|string|max:1000', // ✅ matches JS: { question }
        ]);

        // Save user message
        $userMessage = Message::create([
            'note_id' => $note->id,
            'role'    => 'user',
            'content' => $validated['question'],
        ]);

        // Get chat history (excluding the message we just saved)
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

        // ✅ Returns { response } to match JS: data.response
        return response()->json([
            'response' => $aiResponse,
        ]);
    }

    /**
     * GET /api/notes/{note}/chat
     * Returns { messages: [...] } to match JS: data.messages
     */
    public function history(Note $note)
    {
        $messages = $note->messages()->orderBy('id')->get();

        return response()->json([
            'messages' => $messages,
        ]);
    }
}
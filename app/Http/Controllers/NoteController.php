<?php

namespace App\Http\Controllers;

use App\Models\Note;
use App\Services\AiService;
use App\Services\FileParserService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class NoteController extends Controller
{
    protected $aiService;
    protected $fileParser;

    public function __construct(AiService $aiService, FileParserService $fileParser)
    {
        $this->aiService = $aiService;
        $this->fileParser = $fileParser;
    }

    /**
     * POST /api/summarize
     * Guests: returns summary without saving to DB
     * Logged in: saves note linked to their account
     */
    public function summarize(Request $request)
    {
        try {
            $text = null;

            if ($request->hasFile('file')) {
                $request->validate([
                    'file' => [
                        'required', 'file',
                        'mimes:' . implode(',', config('notemaster.upload.allowed_extensions')),
                        'max:'   . config('notemaster.upload.max_size'),
                    ],
                ]);
                $text = $this->fileParser->extractText($request->file('file'));
            } else {
                $request->validate([
                    'notes' => [
                        'required', 'string',
                        'min:' . config('notemaster.notes.min_length'),
                        'max:' . config('notemaster.notes.max_length'),
                    ],
                ]);
                $text = $request->input('notes');
            }

            $summary = $this->aiService->generateSummary($text);
            $title   = $this->generateTitle($text);

            // Save to DB only for authenticated users
            if (Auth::check()) {
                $note = Note::create([
                    'user_id'          => Auth::id(),
                    'title'            => $title,
                    'original_content' => $text,
                    'summary'          => $summary,
                ]);

                return response()->json([
                    'note_id' => $note->id,
                    'summary' => $summary,
                    'title'   => $note->title,
                    'saved'   => true,
                ], 201);
            }

            // Guest: return summary only, nothing saved
            return response()->json([
                'note_id' => null,
                'summary' => $summary,
                'title'   => $title,
                'saved'   => false,
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['error' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * GET /api/notes — only returns the logged-in user's notes
     */
    public function index(Request $request)
    {
        if (!Auth::check()) {
            return response()->json(['notes' => []]);
        }

        $query = Note::with('tags')->where('user_id', Auth::id());

        if ($request->filled('search')) {
            $query->search($request->search);
        }

        if ($request->filled('tag_id')) {
            $query->withTag($request->tag_id);
        }

        return response()->json(['notes' => $query->latest()->get()]);
    }

    /**
     * GET /api/notes/{note}
     */
    public function show(Note $note)
    {
        if (!Auth::check() || $note->user_id !== Auth::id()) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $note->load('tags');
        return response()->json($note);
    }

    /**
     * DELETE /api/notes/{note}
     */
    public function destroy(Note $note)
    {
        if (!Auth::check() || $note->user_id !== Auth::id()) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $note->delete();
        return response()->json(['message' => 'Note deleted']);
    }

    private function generateTitle($content, $maxLength = 50)
    {
        $lines     = explode("\n", trim($content));
        $firstLine = trim($lines[0] ?? '');

        return empty($firstLine)
            ? 'Note from ' . now()->format('M d, Y')
            : Str::limit($firstLine, $maxLength);
    }
}
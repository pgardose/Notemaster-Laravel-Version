<?php

namespace App\Http\Controllers;

use App\Models\Note;
use App\Services\AiService;
use App\Services\FileParserService;
use Illuminate\Http\Request;
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
     */
    public function summarize(Request $request)
    {
        try {
            $text = null;

            // Handle file upload
            if ($request->hasFile('file')) {
                $request->validate([
                    'file' => [
                        'required',
                        'file',
                        'mimes:' . implode(',', config('notemaster.upload.allowed_extensions')),
                        'max:' . config('notemaster.upload.max_size'),
                    ],
                ]);

                $file = $request->file('file');
                $text = $this->fileParser->extractText($file);

            } else {
                // Handle JSON input
                $request->validate([
                    'notes' => [
                        'required',
                        'string',
                        'min:' . config('notemaster.notes.min_length'),
                        'max:' . config('notemaster.notes.max_length'),
                    ],
                ]);

                $text = $request->input('notes');
            }

            // Generate summary via Gemini
            $summary = $this->aiService->generateSummary($text);

            // Generate title from original content
            $title = $this->generateTitle($text);

            // Save note to database
            $note = Note::create([
                'title'            => $title,
                'original_content' => $text,
                'summary'          => $summary,
            ]);

            return response()->json([
                'note_id' => $note->id,
                'summary' => $summary,
                'title'   => $note->title,
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['error' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * GET /api/notes
     * Returns { notes: [...] } to match frontend expectations
     */
    public function index(Request $request)
    {
        $query = Note::with('tags');

        if ($request->has('search') && $request->search) {
            $query->search($request->search);
        }

        if ($request->has('tag_id') && $request->tag_id) {
            $query->withTag($request->tag_id);
        }

        $notes = $query->latest()->get();

        return response()->json(['notes' => $notes]);
    }

    /**
     * GET /api/notes/{note}
     */
    public function show(Note $note)
    {
        $note->load('tags');
        return response()->json($note);
    }

    /**
     * DELETE /api/notes/{note}
     */
    public function destroy(Note $note)
    {
        $note->delete();
        return response()->json(['message' => 'Note deleted']);
    }

    /**
     * Generate a short title from the first line of content
     */
    private function generateTitle($content, $maxLength = 50)
    {
        $lines = explode("\n", trim($content));
        $firstLine = trim($lines[0] ?? '');

        if (empty($firstLine)) {
            return 'Note from ' . now()->format('M d, Y');
        }

        return Str::limit($firstLine, $maxLength);
    }
}
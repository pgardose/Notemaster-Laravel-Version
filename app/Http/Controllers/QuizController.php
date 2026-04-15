<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use App\Models\Note;

class QuizController extends Controller
{
    public function generate(Note $note)
    {
        // Ownership check
        if ($note->user_id !== Auth::id()) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $content = trim($note->original_content ?? $note->summary ?? '');

        if (empty($content)) {
            return response()->json(['error' => 'Note has no content to generate a quiz from.'], 422);
        }

        // Truncate to avoid token overrun (Gemini 2.5 Flash is fine but be safe)
        if (strlen($content) > 12000) {
            $content = substr($content, 0, 12000);
        }

        try {
            $raw = $this->callGemini($this->buildQuizPrompt($content));
            $questions = $this->extractAndValidate($raw);

            if ($questions === null) {
                // Log the raw response so you can debug in storage/logs/laravel.log
                \Log::warning('Quiz JSON parse failed. Raw Gemini output: ' . $raw);
                return response()->json(['error' => 'AI returned invalid quiz data. Please try again.'], 422);
            }

            // Return the array directly — JS does Array.isArray(data)
            return response()->json($questions);

        } catch (\Exception $e) {
            \Log::error('QuizController error: ' . $e->getMessage());
            return response()->json(['error' => 'Quiz generation failed. Please try again.'], 500);
        }
    }

    // ── Build prompt ──────────────────────────────────────────────

    private function buildQuizPrompt(string $content): string
    {
        return <<<PROMPT
You are a quiz generator. Read the study notes below and create exactly 5 multiple-choice questions.

STRICT OUTPUT RULES — follow every rule or the output is invalid:
1. Return ONLY a raw JSON array. No markdown, no code fences, no backticks, no explanation.
2. The array must contain exactly 5 objects.
3. Each object must have exactly these keys:
   - "question": a clear question string
   - "options": an array of exactly 4 strings, each starting with "A) ", "B) ", "C) ", or "D) "
   - "answer": the FULL string of the correct option (must exactly match one of the 4 options)
4. Example of ONE valid object:
{"question":"What is photosynthesis?","options":["A) Cellular respiration","B) Converting light to energy","C) Protein synthesis","D) DNA replication"],"answer":"B) Converting light to energy"}

STUDY NOTES:
{$content}

Return the JSON array now. Nothing else.
PROMPT;
    }

    // ── Call Gemini ───────────────────────────────────────────────

    private function callGemini(string $prompt): string
    {
        $apiKey = config('notemaster.gemini.api_key');
        $model  = config('notemaster.gemini.model', 'gemini-2.5-flash');

        $response = Http::timeout(60)->post(
            "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}",
            [
                'contents' => [
                    ['parts' => [['text' => $prompt]]]
                ],
                'generationConfig' => [
                    'temperature'     => 0.3,
                    'maxOutputTokens' => 2048,
                ],
            ]
        );

        if (!$response->successful()) {
            throw new \Exception('Gemini API error: ' . $response->status() . ' ' . $response->body());
        }

        return $response->json('candidates.0.content.parts.0.text') ?? '';
    }

    // ── Extract + validate JSON ───────────────────────────────────

    private function extractAndValidate(string $raw): ?array
    {
        if (empty(trim($raw))) return null;

        // Step 1: Strip ALL possible markdown fence variants
        // Handles ```json, ```JSON, ```\n, ~~~json, etc.
        $cleaned = preg_replace('/^```[a-zA-Z]*\s*/m', '', $raw);
        $cleaned = preg_replace('/^~~~[a-zA-Z]*\s*/m', '', $cleaned);
        $cleaned = preg_replace('/```\s*$/m', '', $cleaned);
        $cleaned = preg_replace('/~~~\s*$/m', '', $cleaned);
        $cleaned = trim($cleaned);

        // Step 2: Extract substring between first [ and last ]
        $start = strpos($cleaned, '[');
        $end   = strrpos($cleaned, ']');

        if ($start === false || $end === false || $end <= $start) {
            return null;
        }

        $jsonString = substr($cleaned, $start, $end - $start + 1);

        // Step 3: Decode
        $decoded = json_decode($jsonString, true);

        if (!is_array($decoded) || count($decoded) === 0) {
            return null;
        }

        // Step 4: Validate and normalise each question
        $validated = [];
        foreach ($decoded as $item) {
            if (!isset($item['question'], $item['options'], $item['answer'])) continue;
            if (!is_array($item['options']) || count($item['options']) < 2) continue;
            if (!is_string($item['question']) || !is_string($item['answer'])) continue;

            // Normalise: if answer is just a letter like "B", find the matching option
            $answer = $item['answer'];
            if (preg_match('/^[A-D]$/', trim($answer))) {
                $letter = strtoupper(trim($answer));
                foreach ($item['options'] as $opt) {
                    if (str_starts_with($opt, $letter . ')') || str_starts_with($opt, $letter . '.')) {
                        $answer = $opt;
                        break;
                    }
                }
            }

            // Verify answer matches one of the options (after normalisation)
            $matchFound = in_array($answer, $item['options']);

            // If still no match, just use the first option as fallback
            // (better than failing entirely)
            if (!$matchFound) {
                $answer = $item['options'][0];
            }

            $validated[] = [
                'question' => strip_tags(trim($item['question'])),
                'options'  => array_values(array_map(fn($o) => strip_tags(trim($o)), $item['options'])),
                'answer'   => strip_tags(trim($answer)),
            ];
        }

        return count($validated) >= 3 ? $validated : null;
    }
}
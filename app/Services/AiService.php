<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class AiService
{
    protected $apiKey;
    protected $model;

    public function __construct()
    {
        $this->apiKey = config('notemaster.gemini.api_key');
        $this->model  = config('notemaster.gemini.model');

        if (!$this->apiKey) {
            throw new \Exception('GEMINI_API_KEY not configured in .env file');
        }
    }

    /**
     * Generate summary from text
     */
    public function generateSummary(string $text): string
    {
        $prompt = $this->buildSummaryPrompt($text);
        return $this->callGemini($prompt);
    }

    /**
     * Generate chat response
     */
    public function generateChatResponse($noteContent, $summary, $chatHistory, $userQuestion): string
    {
        $prompt = $this->buildChatPrompt($noteContent, $summary, $chatHistory, $userQuestion);
        return $this->callGemini($prompt);
    }

    /**
     * Build summary prompt
     */
    private function buildSummaryPrompt(string $text): string
    {
        return <<<PROMPT
You are an expert study assistant. Analyze the following study notes and create a comprehensive, well-organized summary.

FORMATTING RULES (VERY IMPORTANT):
- Use bullet points with the • symbol (NOT asterisks *)
- Do NOT use markdown formatting
- No ** for bold, no * for bullets, no __ for italics
- Use plain text with • for bullet points
- Be clear and concise

STUDY NOTES:
{$text}

SUMMARY:
PROMPT;
    }

    /**
     * Build chat prompt
     */
    private function buildChatPrompt($noteContent, $summary, $chatHistory, $userQuestion): string
    {
        $prompt = <<<PROMPT
You are a helpful AI study assistant. A student has taken notes and you've summarized them. Now they have a question about their notes.

FORMATTING RULES:
- Do NOT use asterisks (*) for formatting
- No markdown syntax
- Use proper punctuation
- Be conversational

ORIGINAL NOTES:
{$noteContent}

SUMMARY:
{$summary}

CHAT HISTORY:

PROMPT;

        foreach ($chatHistory as $msg) {
            $role    = $msg['role'] === 'user' ? 'Student' : 'Assistant';
            $prompt .= "{$role}: {$msg['content']}\n";
        }

        $prompt .= "\nStudent: {$userQuestion}\n\nAssistant:";

        return $prompt;
    }

    /**
     * Call Gemini API
     */
    private function callGemini(string $prompt): string
    {
        $url = "https://generativelanguage.googleapis.com/v1beta/models/{$this->model}:generateContent?key={$this->apiKey}";

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
        ])->post($url, [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt]
                    ]
                ]
            ],
            'generationConfig' => [
            'temperature'     => 0.7,
            'maxOutputTokens' => 8192,
            'topP'            => 0.95,
            ]
        ]);

        if (!$response->successful()) {
            throw new \Exception('Gemini API error: ' . $response->body());
        }

        $data = $response->json();
        $text = $data['candidates'][0]['content']['parts'][0]['text'] ?? '';

        // Clean up any leftover markdown
        $text = str_replace(['**', '__', '_'], '', $text);
        $text = str_replace('*', '•', $text);

        return trim($text);
    }
}
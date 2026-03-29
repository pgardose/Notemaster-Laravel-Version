<?php

return [
    'provider' => env('AI_PROVIDER', 'gemini'), // gemini, openai
    'api_key' => env('GEMINI_API_KEY') ?? env('OPENAI_API_KEY'),
    'model' => env('AI_MODEL', 'gemini-1.5-flash'),
];
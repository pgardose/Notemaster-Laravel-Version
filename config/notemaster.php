<?php

return [
    
    /*
    |--------------------------------------------------------------------------
    | Gemini AI Configuration
    |--------------------------------------------------------------------------
    | Maps to your Flask config.py GEMINI_API_KEY and GEMINI_MODEL
    |
    */
    
    'gemini' => [
        'api_key' => env('GEMINI_API_KEY'),
        'model' => env('GEMINI_MODEL', 'gemini-2.5-flash'),
    ],
    
    /*
    |--------------------------------------------------------------------------
    | File Upload Settings
    |--------------------------------------------------------------------------
    | Maps to your Flask config.py MAX_CONTENT_LENGTH and ALLOWED_EXTENSIONS
    |
    */
    
    'upload' => [
        'max_size' => env('MAX_FILE_SIZE', 16384), // in KB (16MB)
        'allowed_extensions' => explode(',', env('ALLOWED_EXTENSIONS', 'pdf,txt')),
    ],
    
    /*
    |--------------------------------------------------------------------------
    | Note Settings
    |--------------------------------------------------------------------------
    | Maps to your Flask config.py NOTES_MAX_LENGTH and NOTES_MIN_LENGTH
    |
    */
    
    'notes' => [
        'max_length' => env('NOTES_MAX_LENGTH', 50000),
        'min_length' => env('NOTES_MIN_LENGTH', 10),
    ],
    
];
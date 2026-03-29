<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Message extends Model
{
    protected $fillable = [
        'note_id',
        'role',
        'content',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    /**
     * Message belongs to a Note
     */
    public function note(): BelongsTo
    {
        return $this->belongsTo(Note::class);
    }
}
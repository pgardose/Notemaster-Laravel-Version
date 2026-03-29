<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Note extends Model
{
    protected $fillable = [
        'title',
        'original_content',
        'summary',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Many-to-many: Note has many Tags
     * (matches your Flask: tags = db.relationship('Tag', secondary=note_tags))
     */
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class)
                    ->withTimestamps();
    }

    /**
     * One-to-many: Note has many Messages
     * (matches your Flask: chat_messages = db.relationship with cascade delete)
     */
    public function messages(): HasMany
    {
        return $this->hasMany(Message::class)
                    ->orderBy('created_at');
    }

    /**
     * Search scope (for your search feature)
     */
    public function scopeSearch($query, $term)
    {
        return $query->where('title', 'like', "%{$term}%")
                     ->orWhere('original_content', 'like', "%{$term}%")
                     ->orWhere('summary', 'like', "%{$term}%");
    }

    /**
     * Filter by tag (for tag filtering)
     */
    public function scopeWithTag($query, $tagId)
    {
        return $query->whereHas('tags', function($q) use ($tagId) {
            $q->where('tags.id', $tagId);
        });
    }
}
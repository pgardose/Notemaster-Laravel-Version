<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Note extends Model
{
    protected $fillable = [
        'user_id',           // ← THIS WAS MISSING
        'title',
        'original_content',
        'summary',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Note belongs to a User
    public function user(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class);
    }

    // Many-to-many: Note has many Tags
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class)->withTimestamps();
    }

    // One-to-many: Note has many Messages
    public function messages(): HasMany
    {
        return $this->hasMany(Message::class)->orderBy('created_at');
    }

    // Search scope
    public function scopeSearch($query, $term)
    {
        return $query->where(function($q) use ($term) {
            $q->where('title', 'like', "%{$term}%")
              ->orWhere('original_content', 'like', "%{$term}%")
              ->orWhere('summary', 'like', "%{$term}%");
        });
    }

    // Filter by tag
    public function scopeWithTag($query, $tagId)
    {
        return $query->whereHas('tags', function($q) use ($tagId) {
            $q->where('tags.id', $tagId);
        });
    }
}
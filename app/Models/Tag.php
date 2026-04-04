<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Tag extends Model
{
    protected $fillable = [
        'name',
        'color',
    ];

    /**
     * Many-to-many: Tag belongs to many Notes
     * (matches your Flask backref='notes')
     */
    public function notes(): BelongsToMany
    {
        return $this->belongsToMany(Note::class)
                    ->withTimestamps();
    }
}
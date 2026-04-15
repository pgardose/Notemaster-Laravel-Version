<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Tag;

class TagSeeder extends Seeder
{
    /**
     * Creates 5 study-relevant, color-coded tags.
     *
     * Uses firstOrCreate on the `name` column so the seeder is
     * safe to re-run without duplicating records.
     */
    public function run(): void
    {
        $tags = [
            ['name' => 'Science',    'color' => '#10b981'], // emerald-500
            ['name' => 'History',    'color' => '#f59e0b'], // amber-500
            ['name' => 'Math',       'color' => '#6366f1'], // indigo-500
            ['name' => 'Literature', 'color' => '#8b5cf6'], // violet-500
            ['name' => 'Urgent',     'color' => '#ef4444'], // red-500
        ];

        foreach ($tags as $tag) {
            Tag::firstOrCreate(
                ['name'  => $tag['name']],
                ['color' => $tag['color']]
            );
        }
    }
}
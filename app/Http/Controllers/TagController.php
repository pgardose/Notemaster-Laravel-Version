<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use App\Models\Note;
use Illuminate\Http\Request;

class TagController extends Controller
{
    /**
     * GET /api/tags
     * Returns { tags: [...] } to match frontend expectations
     */
    public function index()
    {
        $tags = Tag::all();
        return response()->json(['tags' => $tags]);
    }

    /**
     * POST /api/tags
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'  => 'required|string|max:50|unique:tags,name',
            'color' => 'required|string|size:7',
        ]);

        $tag = Tag::create($validated);

        return response()->json($tag, 201);
    }

    /**
     * POST /api/notes/{note}/tags
     */
    public function attach(Request $request, Note $note)
    {
        $validated = $request->validate([
            'tag_id' => 'required|exists:tags,id',
        ]);

        // syncWithoutDetaching prevents duplicate pivot rows
        $note->tags()->syncWithoutDetaching([$validated['tag_id']]);

        return response()->json(['message' => 'Tag added to note']);
    }

    /**
     * DELETE /api/notes/{note}/tags/{tag}
     */
    public function detach(Note $note, Tag $tag)
    {
        $note->tags()->detach($tag->id);

        return response()->json(['message' => 'Tag removed from note']);
    }
}
<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    {{-- Pass auth state to JS --}}
    <meta name="is-authenticated" content="{{ Auth::check() ? 'true' : 'false' }}">
    <meta name="description" content="NoteMaster AI - Intelligent study companion">
    <title>NoteMaster AI - Smart Study Assistant</title>

    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>

    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                        display: ['Space Grotesk', 'sans-serif'],
                    },
                    colors: {
                        dark: { 900: '#0f111a', 800: '#1a1d2e', 700: '#292d42' },
                        primary: { 400: '#818cf8', 500: '#6366f1', 600: '#4f46e5' },
                        accent: { purple: '#a855f7', pink: '#ec4899' }
                    },
                    animation: {
                        'float': 'float 6s ease-in-out infinite',
                        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                        'fadeIn': 'fadeIn 0.5s ease-out',
                        'slideIn': 'slideIn 0.3s ease-out',
                    },
                    keyframes: {
                        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-20px)' } },
                        fadeIn: { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
                        slideIn: { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
                    }
                }
            }
        }
    </script>

    <style>
        body {
            background-color: #0f111a;
            background-image:
                radial-gradient(at 0% 0%, rgba(99,102,241,0.15) 0px, transparent 50%),
                radial-gradient(at 100% 0%, rgba(168,85,247,0.15) 0px, transparent 50%),
                radial-gradient(at 100% 100%, rgba(236,72,153,0.15) 0px, transparent 50%);
            background-attachment: fixed;
        }
        .glass {
            background: rgba(30,41,59,0.4);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255,255,255,0.05);
            box-shadow: 0 4px 30px rgba(0,0,0,0.1);
        }
        .glass-panel {
            background: rgba(30,41,59,0.7);
            backdrop-filter: blur(16px);
            border: 1px solid rgba(255,255,255,0.08);
        }
        .sidebar {
            background: rgba(15,17,26,0.8);
            backdrop-filter: blur(16px);
            border-right: 1px solid rgba(255,255,255,0.05);
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #475569; }
        .gradient-text {
            background: linear-gradient(135deg, #818cf8 0%, #d8b4fe 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .spinner {
            border: 3px solid #334155;
            border-top-color: #6366f1;
            border-radius: 50%;
            width: 40px; height: 40px;
            animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Sidebar note item hover */
        .sidebar-note-item {
            transition: all 0.15s ease;
            border-left: 2px solid transparent;
        }
        .sidebar-note-item:hover {
            background: rgba(99,102,241,0.1);
            border-left-color: #6366f1;
        }

        /* App layout */
        .app-layout {
            display: flex;
            height: 100vh;
            overflow: hidden;
        }
        .sidebar-panel {
            width: 260px;
            flex-shrink: 0;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        .main-panel {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        .main-content {
            flex: 1;
            overflow-y: auto;
        }
    </style>
</head>
<body class="text-slate-200 antialiased">

<div class="app-layout">

    {{-- ═══════════════════════════════════════════════════════
         LEFT SIDEBAR
    ═══════════════════════════════════════════════════════ --}}
    <aside class="sidebar-panel sidebar">

        {{-- Brand --}}
        <div class="p-4 border-b border-white/5 flex items-center gap-3">
            <div class="bg-gradient-to-br from-primary-500 to-accent-purple p-2 rounded-xl shadow-lg shadow-primary-500/20 flex-shrink-0">
                <i data-lucide="brain-circuit" class="w-5 h-5 text-white"></i>
            </div>
            <span class="font-display font-bold text-lg tracking-tight">
                NoteMaster <span class="gradient-text">AI</span>
            </span>
        </div>

        {{-- New Note button --}}
        <div class="p-3">
            <button id="newNoteBtn"
                class="w-full flex items-center gap-2 px-3 py-2.5 bg-primary-500/10 hover:bg-primary-500/20 border border-primary-500/20 rounded-xl text-primary-400 text-sm font-medium transition">
                <i data-lucide="plus" class="w-4 h-4"></i>
                New Note
            </button>
        </div>

        {{-- Sidebar notes list --}}
        <div class="px-3 py-1">
            <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 mb-2">History</p>
        </div>

        <div id="sidebarNotesList" class="flex-1 overflow-y-auto px-3 space-y-1">
            @auth
                {{-- Populated by JS --}}
                <div id="sidebarLoading" class="flex items-center justify-center py-8">
                    <div class="spinner" style="width:24px;height:24px;border-width:2px;"></div>
                </div>
            @else
                {{-- Guest state --}}
                <div class="text-center py-8 px-2">
                    <div class="w-10 h-10 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-3 border border-white/5">
                        <i data-lucide="lock" class="w-5 h-5 text-slate-500"></i>
                    </div>
                    <p class="text-slate-500 text-xs leading-relaxed mb-3">Log in to save and view your note history</p>
                    <a href="/login" class="inline-block text-xs bg-primary-500/10 hover:bg-primary-500/20 border border-primary-500/20 text-primary-400 px-3 py-1.5 rounded-lg transition">
                        Log in
                    </a>
                </div>
            @endauth
        </div>

        {{-- Bottom: user info or auth links --}}
        <div class="p-3 border-t border-white/5">
            @auth
                <div class="relative" id="userMenuWrapper">
                    <button id="userMenuBtn"
                        class="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition text-left">
                        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-purple flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {{ strtoupper(substr(Auth::user()->name, 0, 1)) }}
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium text-white truncate">{{ Auth::user()->name }}</p>
                            <p class="text-xs text-slate-500 truncate">{{ Auth::user()->email }}</p>
                        </div>
                        <i data-lucide="chevron-up" class="w-4 h-4 text-slate-500 flex-shrink-0"></i>
                    </button>

                    {{-- Dropdown --}}
                    <div id="userMenu" class="hidden absolute bottom-full left-0 right-0 mb-1 glass-panel rounded-xl py-1 shadow-2xl">
                        <form method="POST" action="/logout">
                            @csrf
                            <button type="submit"
                                class="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition">
                                <i data-lucide="log-out" class="w-4 h-4"></i>
                                Log out
                            </button>
                        </form>
                    </div>
                </div>
            @else
                <div class="flex gap-2">
                    <a href="/login"
                        class="flex-1 text-center text-sm py-2 rounded-lg border border-white/10 hover:bg-white/5 text-slate-300 transition">
                        Log in
                    </a>
                    <a href="/register"
                        class="flex-1 text-center text-sm py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-medium transition">
                        Sign up
                    </a>
                </div>
            @endauth
        </div>
    </aside>

    {{-- ═══════════════════════════════════════════════════════
         MAIN PANEL
    ═══════════════════════════════════════════════════════ --}}
    <div class="main-panel">

        {{-- Top Nav --}}
        <nav class="glass border-b border-white/5 flex-shrink-0">
            <div class="px-6 h-14 flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <button id="newNoteBtnTop"
                        class="px-4 py-2 rounded-lg text-sm font-medium bg-dark-700/80 text-white border border-white/10 hover:border-primary-500/30 transition flex items-center gap-2">
                        <i data-lucide="plus-circle" class="w-4 h-4"></i>New Note
                    </button>
                    <button id="myNotesBtnTop"
                        class="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition flex items-center gap-2">
                        <i data-lucide="folder" class="w-4 h-4"></i>My Notes
                    </button>
                </div>

                {{-- Guest badge --}}
                @guest
                    <div class="flex items-center gap-2">
                        <span class="text-xs text-slate-500 hidden sm:block">Summaries not saved as guest</span>
                        <a href="/login" class="text-sm px-3 py-1.5 border border-white/10 rounded-lg hover:bg-white/5 text-slate-300 transition">Log in</a>
                        <a href="/register" class="text-sm px-3 py-1.5 bg-primary-500 hover:bg-primary-600 rounded-lg text-white font-medium transition">Sign up</a>
                    </div>
                @endguest

                @auth
                    <span class="text-xs text-slate-500 hidden sm:block">Signed in as <span class="text-slate-300">{{ Auth::user()->name }}</span></span>
                @endauth
            </div>
        </nav>

        {{-- Flash message --}}
        @if(session('success'))
            <div class="mx-6 mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-sm">
                {{ session('success') }}
            </div>
        @endif

        {{-- Scrollable content area --}}
        <div class="main-content px-6 py-6">
            <div class="max-w-3xl mx-auto">

            {{-- Ambient blobs --}}
            <div class="fixed top-0 left-64 -z-10 w-96 h-96 bg-primary-500/10 rounded-full blur-[128px] pointer-events-none"></div>
            <div class="fixed bottom-0 right-0 -z-10 w-96 h-96 bg-accent-purple/10 rounded-full blur-[128px] pointer-events-none animate-float"></div>

            {{-- ── NEW NOTE SECTION ── --}}
            <section id="newNoteSection">

                {{-- Guest banner --}}
                @guest
                    <div class="mb-6 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-start gap-3">
                        <i data-lucide="info" class="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5"></i>
                        <div>
                            <p class="text-sm text-indigo-300 font-medium">You're using NoteMaster as a guest</p>
                            <p class="text-xs text-indigo-400/70 mt-0.5">Summaries won't be saved.
                                <a href="/register" class="underline hover:text-indigo-300">Create a free account</a> to keep your notes.
                            </p>
                        </div>
                    </div>
                @endguest

                {{-- Input card --}}
                <div class="glass rounded-3xl p-6 mb-6">
                    <div class="flex items-center justify-between mb-4">
                        <h2 class="font-display font-bold text-xl text-white">Summarize Notes</h2>
                        <div class="flex bg-dark-800/80 p-1 rounded-xl border border-white/5">
                            <button id="textTabBtn"
                                class="px-4 py-2 rounded-lg text-sm font-medium bg-primary-500 text-white transition">
                                <i data-lucide="type" class="w-4 h-4 inline mr-1"></i>Text
                            </button>
                            <button id="fileTabBtn"
                                class="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition">
                                <i data-lucide="file-up" class="w-4 h-4 inline mr-1"></i>File
                            </button>
                        </div>
                    </div>

                    {{-- Text input --}}
                    <div id="textInput">
                        <textarea id="notesInput" rows="8"
                            placeholder="Paste your study notes here..."
                            class="w-full bg-dark-900/50 border border-white/10 rounded-2xl px-5 py-4 text-slate-200 placeholder-slate-600 focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 outline-none transition resize-none text-sm leading-relaxed"></textarea>
                        <div class="flex justify-end mt-2">
                            <span class="text-xs text-slate-600"><span id="charCounter">0</span> / 50,000</span>
                        </div>
                    </div>

                    {{-- File input --}}
                    <div id="fileInput" class="hidden">
                        <label class="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:border-primary-500/50 hover:bg-primary-500/5 transition">
                            <i data-lucide="upload-cloud" class="w-10 h-10 text-slate-500 mb-3"></i>
                            <span class="text-slate-400 text-sm font-medium">Click to upload PDF or TXT</span>
                            <span class="text-slate-600 text-xs mt-1">Max 16MB</span>
                            <input type="file" id="fileUpload" class="hidden" accept=".pdf,.txt">
                        </label>
                        <p id="fileName" class="text-sm text-slate-400 mt-3 text-center"></p>
                    </div>

                    <button id="summarizeBtn"
                        class="mt-4 w-full py-3 bg-gradient-to-r from-primary-500 to-accent-purple hover:from-primary-600 hover:to-purple-700 text-white font-semibold rounded-2xl transition flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20">
                        <i data-lucide="sparkles" class="w-5 h-5"></i>
                        Summarize with AI
                    </button>
                </div>

                {{-- Loading --}}
                <div id="loading" class="hidden glass rounded-3xl p-12 flex flex-col items-center gap-4">
                    <div class="spinner"></div>
                    <p class="text-slate-400">Analyzing your notes...</p>
                </div>

                {{-- Error --}}
                <div id="errorSection" class="hidden glass rounded-2xl p-4 border border-red-500/20 bg-red-500/10 flex items-start gap-3">
                    <i data-lucide="alert-circle" class="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"></i>
                    <p id="errorMessage" class="text-red-400 text-sm"></p>
                </div>

                {{-- Output --}}
                <div id="outputSection" class="hidden glass rounded-3xl p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="font-display font-bold text-lg text-white">Summary</h3>
                        <div class="flex gap-2">
                            <button id="copyBtn"
                                class="px-3 py-1.5 bg-dark-700 hover:bg-dark-600 border border-white/10 rounded-lg text-sm text-slate-300 transition flex items-center gap-2">
                                <i data-lucide="copy" class="w-4 h-4"></i>Copy
                            </button>
                            <button id="saveBtn"
                                class="px-3 py-1.5 bg-green-600 hover:bg-green-500 rounded-lg text-sm text-white font-medium transition flex items-center gap-2">
                                <i data-lucide="bookmark" class="w-4 h-4"></i>Save
                            </button>
                        </div>
                    </div>

                    <div id="summaryOutput"
                        class="bg-dark-900/30 rounded-2xl p-5 text-slate-300 text-sm leading-relaxed prose prose-invert prose-sm max-w-none">
                    </div>

                    {{-- Guest chat --}}
                    @guest
                        <div id="guestChatSection" class="mt-4 border-t border-white/5 pt-4">
                            <p class="text-xs text-slate-500 mb-3">Chat about this summary (guest session)</p>
                            <div id="guestChatMessages" class="space-y-3 mb-3 max-h-64 overflow-y-auto"></div>
                            <div class="flex gap-2">
                                <input type="text" id="guestChatInput"
                                    placeholder="Ask a question about this summary..."
                                    class="flex-1 bg-dark-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:border-primary-500 outline-none transition">
                                <button id="guestSendBtn"
                                    class="px-4 py-2.5 bg-primary-500 hover:bg-primary-600 rounded-xl transition">
                                    <i data-lucide="send" class="w-4 h-4"></i>
                                </button>
                            </div>
                        </div>
                    @endguest

                    {{-- Auth user tag section --}}
                    @auth
                        <div id="tagSection" class="hidden mt-4 border-t border-white/5 pt-4">
                            <p class="text-xs text-slate-500 mb-3">Add tags to this note</p>
                            <div class="flex gap-2 flex-wrap mb-3" id="selectedTags"></div>
                            <div class="flex gap-2">
                                <select id="tagSelect"
                                    class="flex-1 bg-dark-900/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-300 outline-none focus:border-primary-500 transition">
                                    <option value="">Select a tag...</option>
                                </select>
                                <button id="addTagBtn"
                                    class="px-4 py-2 bg-dark-700 hover:bg-dark-600 border border-white/10 rounded-xl text-sm transition">
                                    Add
                                </button>
                                <button id="newTagBtn"
                                    class="px-4 py-2 bg-primary-500/10 hover:bg-primary-500/20 border border-primary-500/20 text-primary-400 rounded-xl text-sm transition">
                                    + New Tag
                                </button>
                            </div>
                        </div>
                    @endauth
                </div>
            </section>

            {{-- ── MY NOTES SECTION ── --}}
            <section id="myNotesSection" class="hidden">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <h2 class="font-display font-bold text-2xl text-white">My Notes</h2>
                    <div class="flex gap-3">
                        <div class="relative">
                            <i data-lucide="search" class="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2"></i>
                            <input type="text" id="searchInput" placeholder="Search notes..."
                                class="bg-dark-800 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm focus:ring-2 focus:ring-primary-500/50 outline-none transition">
                        </div>
                        <select id="tagFilter"
                            class="bg-dark-800 border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-300 focus:ring-2 focus:ring-primary-500/50 outline-none">
                            <option value="">All Tags</option>
                        </select>
                    </div>
                </div>

                @guest
                    <div class="glass rounded-3xl p-12 text-center">
                        <i data-lucide="lock" class="w-12 h-12 text-slate-600 mx-auto mb-4"></i>
                        <h3 class="text-xl font-bold text-white mb-2">Notes are not saved for guests</h3>
                        <p class="text-slate-500 mb-6">Create a free account to permanently save your notes.</p>
                        <div class="flex gap-3 justify-center">
                            <a href="/register" class="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition">Sign up free</a>
                            <a href="/login" class="px-6 py-2.5 border border-white/10 hover:bg-white/5 text-slate-300 rounded-xl transition">Log in</a>
                        </div>
                    </div>
                @endauth

                @auth
                    <div id="notesGrid" class="grid grid-cols-1 md:grid-cols-2 gap-4"></div>
                    <div id="emptyState" class="hidden text-center py-20">
                        <div class="w-20 h-20 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-5 border border-white/5">
                            <i data-lucide="library" class="w-9 h-9 text-slate-600"></i>
                        </div>
                        <h3 class="text-xl font-bold text-white">No notes yet</h3>
                        <p class="text-slate-500 mt-2">Create your first AI summary to get started!</p>
                        <button onclick="showNewNoteSection()" class="mt-5 text-primary-400 hover:text-primary-300 font-medium transition text-sm">
                            Create New Note →
                        </button>
                    </div>
                @endauth
            </section>

            </div>{{-- max-w-3xl --}}
        </div>{{-- main-content --}}
    </div>{{-- main-panel --}}
</div>{{-- app-layout --}}


{{-- ═══════════════════════════════════════════════════════
     NOTE DETAIL MODAL
═══════════════════════════════════════════════════════ --}}
<div id="noteModal" class="hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-y-auto">
    <div class="min-h-screen px-4 py-8 flex items-center justify-center">
        <div class="glass-panel rounded-3xl max-w-4xl w-full shadow-2xl animate-slideIn">
            <div class="flex items-center justify-between p-6 border-b border-white/10">
                <h3 id="modalTitle" class="text-xl font-display font-bold text-white"></h3>
                <button id="closeModal" class="text-slate-400 hover:text-white p-2 hover:bg-white/5 rounded-lg transition">
                    <i data-lucide="x" class="w-6 h-6"></i>
                </button>
            </div>

            <div class="p-6">
                <div id="modalTags" class="flex flex-wrap gap-2 mb-4"></div>

                <div class="flex mb-4 bg-dark-900/50 p-1 rounded-xl border border-white/5">
                    <button id="summaryTab" class="flex-1 py-2 px-4 rounded-lg bg-dark-700 text-white shadow-sm border border-white/5 transition flex items-center justify-center gap-2">
                        <i data-lucide="file-text" class="w-4 h-4"></i>Summary
                    </button>
                    <button id="originalTab" class="flex-1 py-2 px-4 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition flex items-center justify-center gap-2">
                        <i data-lucide="file-lines" class="w-4 h-4"></i>Original
                    </button>
                    <button id="chatTab" class="flex-1 py-2 px-4 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition flex items-center justify-center gap-2">
                        <i data-lucide="message-circle" class="w-4 h-4"></i>Chat
                    </button>
                </div>

                <div id="summaryContent" class="bg-dark-900/30 rounded-xl p-6 prose prose-invert prose-sm max-w-none max-h-96 overflow-y-auto"></div>

                <div id="originalContent" class="hidden bg-dark-900/30 rounded-xl p-6 max-h-96 overflow-y-auto">
                    <pre id="originalText" class="whitespace-pre-wrap text-slate-300 text-sm leading-relaxed"></pre>
                </div>

                <div id="chatContent" class="hidden">
                    <div id="chatMessages" class="space-y-4 mb-4 max-h-96 overflow-y-auto bg-dark-900/30 rounded-xl p-4"></div>
                    <div class="flex gap-2">
                        <input type="text" id="chatInput" placeholder="Ask a question about this note..."
                            class="flex-1 bg-dark-900/50 border border-white/10 rounded-lg px-4 py-3 text-slate-100 focus:border-primary-500 outline-none transition">
                        <button id="sendChatBtn" class="px-6 py-3 bg-primary-500 hover:bg-primary-600 rounded-lg transition">
                            <i data-lucide="send" class="w-4 h-4"></i>
                        </button>
                    </div>
                </div>
            </div>

            <div class="flex justify-between p-6 border-t border-white/10">
                <button id="deleteNoteBtn" class="px-4 py-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-500/20 rounded-lg transition flex items-center gap-2">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>Delete
                </button>
                <button id="closeModalBtn" class="px-4 py-2 bg-dark-700 hover:bg-dark-600 rounded-lg transition border border-white/10">Close</button>
            </div>
        </div>
    </div>
</div>

{{-- ═══════════════════════════════════════════════════════
     CREATE TAG MODAL
═══════════════════════════════════════════════════════ --}}
<div id="createTagModal" class="hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
    <div class="glass-panel rounded-3xl p-6 max-w-md w-full mx-4 shadow-2xl animate-slideIn">
        <h3 class="text-xl font-display font-bold mb-4 text-white">Create New Tag</h3>
        <div class="space-y-4">
            <div>
                <label class="block text-sm font-medium mb-2 text-slate-300">Tag Name</label>
                <input type="text" id="newTagName" placeholder="e.g., Biology, History"
                    class="w-full bg-dark-900/50 border border-white/10 rounded-lg px-4 py-2 text-slate-100 focus:border-primary-500 outline-none transition">
            </div>
            <div>
                <label class="block text-sm font-medium mb-2 text-slate-300">Color</label>
                <div class="flex gap-2">
                    <input type="color" id="newTagColor" value="#6366f1" class="w-16 h-10 rounded-lg cursor-pointer border border-white/10">
                    <input type="text" id="newTagColorHex" value="#6366f1"
                        class="flex-1 bg-dark-900/50 border border-white/10 rounded-lg px-4 py-2 text-slate-100 font-mono text-sm">
                </div>
            </div>
        </div>
        <div class="flex gap-3 mt-6">
            <button id="cancelTagBtn" class="flex-1 py-2 bg-dark-700 hover:bg-dark-600 rounded-lg transition border border-white/10">Cancel</button>
            <button id="createTagBtn" class="flex-1 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg transition font-medium">Create</button>
        </div>
    </div>
</div>

<script src="{{ asset('js/script.js') }}"></script>
<script>
    // ── User menu toggle ────────────────────────────────────
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userMenu    = document.getElementById('userMenu');
    if (userMenuBtn && userMenu) {
        userMenuBtn.addEventListener('click', () => userMenu.classList.toggle('hidden'));
        document.addEventListener('click', (e) => {
            if (!document.getElementById('userMenuWrapper')?.contains(e.target)) {
                userMenu.classList.add('hidden');
            }
        });
    }

    // ── Sync top nav buttons with sidebar button ────────────
    document.getElementById('newNoteBtnTop')?.addEventListener('click', showNewNoteSection);
    document.getElementById('myNotesBtnTop')?.addEventListener('click', showMyNotesSection);

    // ── Lucide icons ────────────────────────────────────────
    if (typeof lucide !== 'undefined') lucide.createIcons();
</script>
</body>
</html>
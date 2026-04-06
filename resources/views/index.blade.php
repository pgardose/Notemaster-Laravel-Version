<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="is-authenticated" content="{{ Auth::check() ? 'true' : 'false' }}">
    <meta name="description" content="NoteMaster AI - Intelligent study companion">
    <title>NoteMaster AI - Smart Study Assistant</title>

    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>

    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans:    ['Inter', 'sans-serif'],
                        display: ['Space Grotesk', 'sans-serif'],
                    },
                    colors: {
                        primary: { 400: '#818cf8', 500: '#6366f1', 600: '#4f46e5' },
                        accent:  { purple: '#a855f7' }
                    },
                    animation: {
                        fadeIn:  'fadeIn 0.4s ease-out',
                        slideIn: 'slideIn 0.3s ease-out',
                    },
                    keyframes: {
                        fadeIn:  { from: { opacity:'0', transform:'translateY(12px)' }, to: { opacity:'1', transform:'translateY(0)' } },
                        slideIn: { from: { opacity:'0', transform:'translateY(16px)' }, to: { opacity:'1', transform:'translateY(0)' } },
                    }
                }
            }
        }
    </script>

    <style>
        body { background-color: #f8fafc; font-family: 'Inter', sans-serif; }

        .app-layout    { display:flex; height:100vh; overflow:hidden; }
        .sidebar-panel { width:260px; flex-shrink:0; display:flex; flex-direction:column; overflow:hidden; }
        .main-panel    { flex:1; display:flex; flex-direction:column; overflow:hidden; }
        .main-content  { flex:1; overflow-y:auto; }

        .sidebar { background:#ffffff; border-right:1px solid #e2e8f0; }

        .sidebar-note-item {
            transition: all 0.15s ease;
            border-left: 2px solid transparent;
            border-radius: 0.5rem;
        }
        .sidebar-note-item:hover { background:#eef2ff; border-left-color:#6366f1; }

        .card {
            background:#ffffff;
            border:1px solid #e2e8f0;
            border-radius:1rem;
            box-shadow:0 1px 3px rgba(0,0,0,0.06),0 1px 2px rgba(0,0,0,0.04);
        }
        .card-panel {
            background:#ffffff;
            border:1px solid #e2e8f0;
            border-radius:0.875rem;
            box-shadow:0 1px 2px rgba(0,0,0,0.04);
        }

        ::-webkit-scrollbar { width:6px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:#cbd5e1; border-radius:4px; }
        ::-webkit-scrollbar-thumb:hover { background:#94a3b8; }
        .panel-scroll { scrollbar-width:thin; scrollbar-color:#e2e8f0 transparent; }
        .panel-scroll::-webkit-scrollbar { width:4px; }
        .panel-scroll::-webkit-scrollbar-thumb { background:#e2e8f0; border-radius:2px; }

        .gradient-text {
            background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .spinner {
            border:3px solid #e2e8f0;
            border-top-color:#6366f1;
            border-radius:50%;
            width:40px; height:40px;
            animation:spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform:rotate(360deg); } }

        .active-tab   { background:#ffffff; color:#1e293b; font-weight:600; box-shadow:0 1px 3px rgba(0,0,0,0.1); }
        .inactive-tab { background:transparent; color:#64748b; }
        .inactive-tab:hover { color:#1e293b; background:rgba(255,255,255,0.6); }

        #chatDrawer { transition:transform 0.3s cubic-bezier(0.4,0,0.2,1); }

        .note-card {
            background:#ffffff; border:1px solid #e2e8f0; border-radius:1rem;
            transition:all 0.2s ease; cursor:pointer;
        }
        .note-card:hover { border-color:#a5b4fc; box-shadow:0 4px 16px rgba(99,102,241,0.12); transform:translateY(-2px); }
    </style>
</head>
<body class="text-slate-800 antialiased">

<div class="app-layout">

    {{-- ══════════════════════════════
         SIDEBAR
    ══════════════════════════════ --}}
    <aside class="sidebar-panel sidebar">

        <div class="p-4 border-b border-slate-100 flex items-center gap-3">
            <div class="bg-gradient-to-br from-primary-500 to-accent-purple p-2 rounded-xl shadow-sm flex-shrink-0">
                <i data-lucide="brain-circuit" class="w-5 h-5 text-white"></i>
            </div>
            <span class="font-display font-bold text-lg tracking-tight text-slate-800">
                NoteMaster <span class="gradient-text">AI</span>
            </span>
        </div>

        <div class="p-3">
            <button id="newNoteBtn"
                class="w-full flex items-center gap-2 px-3 py-2.5 bg-primary-500 hover:bg-primary-600 rounded-xl text-white text-sm font-medium transition shadow-sm">
                <i data-lucide="plus" class="w-4 h-4"></i>New Note
            </button>
        </div>

        <div class="px-3 py-1">
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2">History</p>
        </div>

        <div id="sidebarNotesList" class="flex-1 overflow-y-auto px-3 space-y-0.5">
            @auth
                <div id="sidebarLoading" class="flex items-center justify-center py-8">
                    <div class="spinner" style="width:24px;height:24px;border-width:2px;"></div>
                </div>
            @else
                <div class="text-center py-8 px-2">
                    <div class="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <i data-lucide="lock" class="w-5 h-5 text-slate-400"></i>
                    </div>
                    <p class="text-slate-400 text-xs leading-relaxed mb-3">Log in to save and view your note history</p>
                    <a href="/login" class="inline-block text-xs bg-primary-500 hover:bg-primary-600 text-white px-3 py-1.5 rounded-lg transition font-medium">Log in</a>
                </div>
            @endauth
        </div>

        <div class="p-3 border-t border-slate-100">
            @auth
                <div class="relative" id="userMenuWrapper">
                    <button id="userMenuBtn"
                        class="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 transition text-left">
                        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-purple flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {{ strtoupper(substr(Auth::user()->name, 0, 1)) }}
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium text-slate-800 truncate">{{ Auth::user()->name }}</p>
                            <p class="text-xs text-slate-400 truncate">{{ Auth::user()->email }}</p>
                        </div>
                        <i data-lucide="chevron-up" class="w-4 h-4 text-slate-400 flex-shrink-0"></i>
                    </button>
                    <div id="userMenu" class="hidden absolute bottom-full left-0 right-0 mb-1 bg-white border border-slate-200 rounded-xl py-1 shadow-lg">
                        <form method="POST" action="/logout">
                            @csrf
                            <button type="submit" class="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition">
                                <i data-lucide="log-out" class="w-4 h-4"></i>Log out
                            </button>
                        </form>
                    </div>
                </div>
            @else
                <div class="flex gap-2">
                    <a href="/login" class="flex-1 text-center text-sm py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition font-medium">Log in</a>
                    <a href="/register" class="flex-1 text-center text-sm py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-medium transition">Sign up</a>
                </div>
            @endauth
        </div>
    </aside>

    {{-- ══════════════════════════════
         MAIN PANEL
    ══════════════════════════════ --}}
    <div class="main-panel">

        <nav class="bg-white border-b border-slate-200 flex-shrink-0">
            <div class="px-6 h-14 flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <button id="newNoteBtnTop"
                        class="px-4 py-2 rounded-lg text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-2">
                        <i data-lucide="plus-circle" class="w-4 h-4"></i>New Note
                    </button>
                    <button id="myNotesBtnTop"
                        class="px-4 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition flex items-center gap-2">
                        <i data-lucide="folder" class="w-4 h-4"></i>My Notes
                    </button>
                </div>
                @guest
                    <div class="flex items-center gap-2">
                        <span class="text-xs text-slate-400 hidden sm:block">Summaries not saved as guest</span>
                        <a href="/login" class="text-sm px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition">Log in</a>
                        <a href="/register" class="text-sm px-3 py-1.5 bg-primary-500 hover:bg-primary-600 rounded-lg text-white font-medium transition">Sign up</a>
                    </div>
                @endguest
                @auth
                    <span class="text-xs text-slate-400 hidden sm:block">Signed in as <span class="text-slate-600 font-medium">{{ Auth::user()->name }}</span></span>
                @endauth
            </div>
        </nav>

        @if(session('success'))
            <div class="mx-6 mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{{ session('success') }}</div>
        @endif

        <div class="main-content bg-slate-50 px-6 py-6">
            <div class="max-w-5xl mx-auto">

            {{-- ── NEW NOTE SECTION ── --}}
            <section id="newNoteSection">

                @guest
                    <div class="mb-5 p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-start gap-3">
                        <i data-lucide="info" class="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5"></i>
                        <div>
                            <p class="text-sm text-indigo-700 font-medium">You're using NoteMaster as a guest</p>
                            <p class="text-xs text-indigo-500 mt-0.5">Summaries won't be saved.
                                <a href="/register" class="underline hover:text-indigo-700 font-medium">Create a free account</a> to keep your notes.
                            </p>
                        </div>
                    </div>
                @endguest

                {{-- Input card --}}
                <div class="card p-6 mb-5">
                    <div class="flex items-center justify-between mb-4">
                        <h2 class="font-display font-bold text-xl text-slate-800">Summarize Notes</h2>
                        <div class="flex bg-slate-100 p-1 rounded-xl">
                            <button id="textTabBtn" class="px-4 py-2 rounded-lg text-sm font-medium bg-white text-slate-700 shadow-sm transition">
                                <i data-lucide="type" class="w-4 h-4 inline mr-1 text-slate-500"></i>Text
                            </button>
                            <button id="fileTabBtn" class="px-4 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-700 transition">
                                <i data-lucide="file-up" class="w-4 h-4 inline mr-1"></i>File
                            </button>
                        </div>
                    </div>

                    <div id="textInput">
                        <textarea id="notesInput" rows="8" placeholder="Paste your study notes here..."
                            class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-700 placeholder-slate-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition resize-none text-sm leading-relaxed"></textarea>
                        <div class="flex justify-end mt-2">
                            <span class="text-xs text-slate-400"><span id="charCounter">0</span> / 50,000</span>
                        </div>
                    </div>

                    <div id="fileInput" class="hidden">
                        <label class="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition">
                            <i data-lucide="upload-cloud" class="w-10 h-10 text-slate-300 mb-3"></i>
                            <span class="text-slate-500 text-sm font-medium">Click to upload PDF or TXT</span>
                            <span class="text-slate-400 text-xs mt-1">Max 16MB</span>
                            <input type="file" id="fileUpload" class="hidden" accept=".pdf,.txt">
                        </label>
                        <p id="fileName" class="text-sm text-slate-500 mt-3 text-center"></p>
                    </div>

                    <button id="summarizeBtn"
                        class="mt-4 w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-2xl transition flex items-center justify-center gap-2 shadow-sm">
                        <i data-lucide="sparkles" class="w-5 h-5"></i>
                        Summarize with AI
                    </button>
                </div>

                <div id="loading" class="hidden card p-12 flex flex-col items-center gap-4">
                    <div class="spinner"></div>
                    <p class="text-slate-500">Analyzing your notes...</p>
                </div>

                <div id="errorSection" class="hidden p-4 border border-red-200 bg-red-50 rounded-2xl flex items-start gap-3">
                    <i data-lucide="alert-circle" class="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"></i>
                    <p id="errorMessage" class="text-red-600 text-sm"></p>
                </div>

                {{-- Output --}}
                <div id="outputSection" class="hidden mt-5">

                    <div class="bg-slate-200 rounded-2xl p-1.5 flex gap-1 mb-4 w-fit">
                        <button id="sideBySideBtn" class="active-tab flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all duration-200">
                            <i data-lucide="columns-2" class="w-4 h-4"></i>Side-by-Side
                        </button>
                        <button id="summaryOnlyBtn" class="inactive-tab flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all duration-200">
                            <i data-lucide="check-circle" class="w-4 h-4"></i>Summary Only
                        </button>
                    </div>

                    <div class="flex gap-4">
                        <div id="originalPanel" class="flex-1 card-panel overflow-hidden">
                            <div class="flex items-center gap-2 px-5 py-3.5 border-b border-slate-100 bg-slate-50">
                                <i data-lucide="file-text" class="w-4 h-4 text-slate-400"></i>
                                <span class="text-sm font-semibold text-slate-600">Original Text</span>
                            </div>
                            <div id="originalPanelText" class="p-5 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap panel-scroll overflow-y-auto max-h-96"></div>
                        </div>

                        <div id="summaryPanel" class="flex-1 card-panel overflow-hidden">
                            <div class="flex items-center gap-2 px-5 py-3.5 border-b border-slate-100 bg-indigo-50">
                                <i data-lucide="sparkles" class="w-4 h-4 text-primary-500"></i>
                                <span class="text-sm font-semibold text-primary-600">AI Summary</span>
                            </div>
                            <div id="summaryPanelText" class="p-5 text-sm leading-relaxed panel-scroll overflow-y-auto max-h-96"></div>
                        </div>
                    </div>

                    <div class="flex items-center gap-3 mt-4">
                        @auth
                        <button id="saveNoteBtn"
                            class="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-all shadow-sm">
                            <i data-lucide="bookmark" class="w-4 h-4"></i>Save Note
                        </button>
                        @endauth
                        <button id="copyBtn"
                            class="flex items-center justify-center w-11 h-11 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-all shadow-sm">
                            <i data-lucide="copy" class="w-4 h-4"></i>
                        </button>
                        <button id="aiChatBtn"
                            class="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold px-5 py-3 rounded-xl transition-all shadow-sm">
                            <i data-lucide="message-circle" class="w-4 h-4"></i>AI Chat
                        </button>
                    </div>

                    @auth
                    <div id="tagSection" class="hidden mt-4 card p-5">
                        <h3 class="text-sm font-semibold text-slate-700 mb-3">Add Tags</h3>
                        <div class="flex gap-2">
                            <select id="tagSelect" class="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100">
                                <option value="">Select a tag...</option>
                            </select>
                            <button id="addTagBtn" class="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm rounded-lg transition">Add</button>
                            <button id="newTagBtn" class="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm rounded-lg transition">+ New</button>
                        </div>
                        <div id="selectedTags" class="flex flex-wrap gap-2 mt-3"></div>
                    </div>
                    @endauth
                </div>

            </section>

            {{-- ── MY NOTES SECTION ── --}}
            <section id="myNotesSection" class="hidden">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <h2 class="font-display font-bold text-2xl text-slate-800">My Notes</h2>
                    <div class="flex gap-3">
                        <div class="relative">
                            <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"></i>
                            <input type="text" id="searchInput" placeholder="Search notes..."
                                class="bg-white border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-sm focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none transition shadow-sm">
                        </div>
                        <select id="tagFilter"
                            class="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-600 focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none shadow-sm">
                            <option value="">All Tags</option>
                        </select>
                    </div>
                </div>

                @guest
                    <div class="card p-12 text-center">
                        <i data-lucide="lock" class="w-12 h-12 text-slate-300 mx-auto mb-4"></i>
                        <h3 class="text-xl font-bold text-slate-700 mb-2">Notes are not saved for guests</h3>
                        <p class="text-slate-400 mb-6">Create a free account to permanently save your notes.</p>
                        <div class="flex gap-3 justify-center">
                            <a href="/register" class="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition shadow-sm">Sign up free</a>
                            <a href="/login" class="px-6 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition">Log in</a>
                        </div>
                    </div>
                @endguest

                @auth
                    <div id="notesGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"></div>
                    <div id="emptyState" class="hidden text-center py-20">
                        <div class="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-5">
                            <i data-lucide="library" class="w-9 h-9 text-slate-300"></i>
                        </div>
                        <h3 class="text-xl font-bold text-slate-700">No notes yet</h3>
                        <p class="text-slate-400 mt-2">Create your first AI summary to get started!</p>
                        <button onclick="showNewNoteSection()" class="mt-5 text-primary-500 hover:text-primary-600 font-medium transition text-sm">Create New Note →</button>
                    </div>
                @endauth
            </section>

            </div>
        </div>
    </div>
</div>


{{-- ══════════════════════════════
     NOTE DETAIL MODAL
══════════════════════════════ --}}
<div id="noteModal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4" style="background:rgba(15,23,42,0.5);backdrop-filter:blur(6px);">
    <div class="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col border border-slate-200 shadow-2xl overflow-hidden animate-slideIn">

        <div class="flex items-start justify-between px-6 py-5 border-b border-slate-100 shrink-0">
            <div>
                <h2 id="modalTitle" class="text-xl font-bold text-slate-800"></h2>
                <div id="modalTags" class="flex flex-wrap gap-2 mt-2"></div>
            </div>
            <div class="flex items-center gap-2 ml-4">
                <button id="deleteNoteBtn" class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
                <button id="closeModal" class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                    <i data-lucide="x" class="w-4 h-4"></i>
                </button>
            </div>
        </div>

        <div class="px-6 pt-4 pb-3 shrink-0 bg-slate-50 border-b border-slate-100">
            <div class="bg-slate-200 rounded-xl p-1 flex gap-1 w-fit">
                <button id="modalSideBySideBtn" class="active-tab flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-200">
                    <i data-lucide="columns-2" class="w-4 h-4"></i>Side-by-Side
                </button>
                <button id="modalSummaryOnlyBtn" class="inactive-tab flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-200">
                    <i data-lucide="check-circle" class="w-4 h-4"></i>Summary Only
                </button>
            </div>
        </div>

        <div class="flex gap-4 p-6 flex-1 min-h-0 bg-slate-50">
            <div id="modalOriginalPanel" class="flex-1 flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm min-h-0">
                <div class="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50 shrink-0">
                    <i data-lucide="file-text" class="w-4 h-4 text-slate-400"></i>
                    <span class="text-sm font-semibold text-slate-600">Original Text</span>
                </div>
                <div id="modalOriginalText" class="p-4 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap panel-scroll overflow-y-auto flex-1"></div>
            </div>

            <div class="flex-1 flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm min-h-0">
                <div class="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-indigo-50 shrink-0">
                    <i data-lucide="sparkles" class="w-4 h-4 text-primary-500"></i>
                    <span class="text-sm font-semibold text-primary-600">AI Summary</span>
                </div>
                <div id="modalSummaryContent" class="p-4 text-sm leading-relaxed panel-scroll overflow-y-auto flex-1"></div>
            </div>
        </div>

        <div class="flex items-center gap-3 px-6 py-4 shrink-0 bg-white border-t border-slate-100">
            <button id="modalCopyBtn"
                class="flex items-center justify-center w-11 h-11 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-all shadow-sm">
                <i data-lucide="copy" class="w-4 h-4"></i>
            </button>
            <button id="modalAiChatBtn"
                class="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold px-5 py-3 rounded-xl transition-all shadow-sm ml-auto">
                <i data-lucide="message-circle" class="w-4 h-4"></i>AI Chat
            </button>
            <button id="closeModalBtn"
                class="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm px-5 py-3 rounded-xl transition-all shadow-sm">
                Close
            </button>
        </div>
    </div>
</div>


{{-- ══════════════════════════════
     CREATE TAG MODAL
══════════════════════════════ --}}
<div id="createTagModal" class="hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
    <div class="bg-white rounded-3xl p-6 max-w-md w-full mx-4 shadow-2xl border border-slate-200 animate-slideIn">
        <h3 class="text-xl font-display font-bold mb-4 text-slate-800">Create New Tag</h3>
        <div class="space-y-4">
            <div>
                <label class="block text-sm font-medium mb-2 text-slate-600">Tag Name</label>
                <input type="text" id="newTagName" placeholder="e.g., Biology, History"
                    class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-700 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition">
            </div>
            <div>
                <label class="block text-sm font-medium mb-2 text-slate-600">Color</label>
                <div class="flex gap-2">
                    <input type="color" id="newTagColor" value="#6366f1" class="w-16 h-10 rounded-lg cursor-pointer border border-slate-200">
                    <input type="text" id="newTagColorHex" value="#6366f1"
                        class="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-700 font-mono text-sm focus:border-primary-400 outline-none">
                </div>
            </div>
        </div>
        <div class="flex gap-3 mt-6">
            <button id="cancelTagBtn" class="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition font-medium">Cancel</button>
            <button id="createTagBtn" class="flex-1 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition font-medium">Create</button>
        </div>
    </div>
</div>


{{-- ══════════════════════════════
     CHAT DRAWER
══════════════════════════════ --}}
<div id="chatDrawerOverlay" class="hidden fixed inset-0 z-[60]" style="background:rgba(15,23,42,0.4);backdrop-filter:blur(4px);"></div>

<div id="chatDrawer" class="fixed top-0 right-0 bottom-0 z-[70] w-full max-w-md flex flex-col border-l border-slate-200 translate-x-full bg-white shadow-2xl">

    <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
        <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                <i data-lucide="sparkles" class="w-4 h-4 text-primary-500"></i>
            </div>
            <span id="chatDrawerTitle" class="font-semibold text-slate-800 text-sm">AI Chat</span>
        </div>
        <button id="chatDrawerClose" class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
            <i data-lucide="x" class="w-4 h-4"></i>
        </button>
    </div>

    <div id="drawerMessages" class="flex-1 overflow-y-auto p-5 panel-scroll bg-slate-50">
        <p class="text-slate-400 text-center py-10 text-sm">Ask anything about your summary!</p>
    </div>

    <div class="p-4 border-t border-slate-100 bg-white shrink-0">
        <div class="flex gap-2 items-end bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-100 transition">
            <textarea id="drawerChatInput" rows="1" placeholder="Ask a question..."
                class="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 resize-none focus:outline-none px-1 py-1.5 panel-scroll"
                style="max-height:8rem;overflow-y:auto;"
                oninput="this.style.height='auto';this.style.height=this.scrollHeight+'px';"></textarea>
            <button id="drawerSendBtn"
                class="w-9 h-9 bg-primary-500 hover:bg-primary-600 rounded-xl flex items-center justify-center text-white transition-all shrink-0 disabled:opacity-50 disabled:cursor-not-allowed">
                <i data-lucide="send" class="w-4 h-4"></i>
            </button>
        </div>
        <p class="text-xs text-slate-400 text-center mt-2">Enter to send · Shift+Enter for new line</p>
    </div>
</div>


<script src="{{ asset('js/script.js') }}"></script>
<script>
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userMenu    = document.getElementById('userMenu');
    if (userMenuBtn && userMenu) {
        userMenuBtn.addEventListener('click', () => userMenu.classList.toggle('hidden'));
        document.addEventListener('click', (e) => {
            if (!document.getElementById('userMenuWrapper')?.contains(e.target)) userMenu.classList.add('hidden');
        });
    }
    document.getElementById('newNoteBtnTop')?.addEventListener('click', showNewNoteSection);
    document.getElementById('myNotesBtnTop')?.addEventListener('click', showMyNotesSection);
    if (typeof lucide !== 'undefined') lucide.createIcons();
</script>
</body>
</html>
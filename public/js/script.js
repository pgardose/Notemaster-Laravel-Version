// ── Auth state (from Blade meta tag) ─────────────────────────
const isAuthenticated = document.querySelector('meta[name="is-authenticated"]')?.content === 'true';

// ── CSRF Token ────────────────────────────────────────────────
const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
function jsonHeaders() { return { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken }; }
function csrfHeaders() { return { 'X-CSRF-TOKEN': csrfToken }; }

// ── State ─────────────────────────────────────────────────────
let currentNoteId    = null;
let allNotes         = [];
let allTags          = [];
let guestSummary     = '';
let guestNoteText    = '';
let guestChatHistory = [];

// ── DOM Elements ──────────────────────────────────────────────
const elements = {
    newNoteBtn:        document.getElementById('newNoteBtn'),
    myNotesBtn:        document.getElementById('myNotesBtn'),
    newNoteSection:    document.getElementById('newNoteSection'),
    myNotesSection:    document.getElementById('myNotesSection'),
    textTabBtn:        document.getElementById('textTabBtn'),
    fileTabBtn:        document.getElementById('fileTabBtn'),
    textInput:         document.getElementById('textInput'),
    fileInput:         document.getElementById('fileInput'),
    notesInput:        document.getElementById('notesInput'),
    charCounter:       document.getElementById('charCounter'),
    fileUpload:        document.getElementById('fileUpload'),
    fileName:          document.getElementById('fileName'),
    summarizeBtn:      document.getElementById('summarizeBtn'),
    copyBtn:           document.getElementById('copyBtn'),
    saveBtn:           document.getElementById('saveBtn'),
    outputSection:     document.getElementById('outputSection'),
    summaryOutput:     document.getElementById('summaryOutput'),
    loading:           document.getElementById('loading'),
    errorSection:      document.getElementById('errorSection'),
    errorMessage:      document.getElementById('errorMessage'),
    tagSection:        document.getElementById('tagSection'),
    tagSelect:         document.getElementById('tagSelect'),
    addTagBtn:         document.getElementById('addTagBtn'),
    newTagBtn:         document.getElementById('newTagBtn'),
    selectedTags:      document.getElementById('selectedTags'),
    guestChatSection:  document.getElementById('guestChatSection'),
    guestChatMessages: document.getElementById('guestChatMessages'),
    guestChatInput:    document.getElementById('guestChatInput'),
    guestSendBtn:      document.getElementById('guestSendBtn'),
    searchInput:       document.getElementById('searchInput'),
    tagFilter:         document.getElementById('tagFilter'),
    notesGrid:         document.getElementById('notesGrid'),
    emptyState:        document.getElementById('emptyState'),
    sidebarNotesList:  document.getElementById('sidebarNotesList'),
    noteModal:         document.getElementById('noteModal'),
    modalTitle:        document.getElementById('modalTitle'),
    modalTags:         document.getElementById('modalTags'),
    closeModal:        document.getElementById('closeModal'),
    closeModalBtn:     document.getElementById('closeModalBtn'),
    deleteNoteBtn:     document.getElementById('deleteNoteBtn'),
    summaryTab:        document.getElementById('summaryTab'),
    originalTab:       document.getElementById('originalTab'),
    chatTab:           document.getElementById('chatTab'),
    summaryContent:    document.getElementById('summaryContent'),
    originalContent:   document.getElementById('originalContent'),
    originalText:      document.getElementById('originalText'),
    chatContent:       document.getElementById('chatContent'),
    chatMessages:      document.getElementById('chatMessages'),
    chatInput:         document.getElementById('chatInput'),
    sendChatBtn:       document.getElementById('sendChatBtn'),
    createTagModal:    document.getElementById('createTagModal'),
    newTagName:        document.getElementById('newTagName'),
    newTagColor:       document.getElementById('newTagColor'),
    newTagColorHex:    document.getElementById('newTagColorHex'),
    createTagBtn:      document.getElementById('createTagBtn'),
    cancelTagBtn:      document.getElementById('cancelTagBtn'),
};

// ── Initialize ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    if (isAuthenticated) {
        loadTags();
        loadSidebarNotes();
    }
    initializeLucideIcons();
});

function initializeLucideIcons() {
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ── Event Listeners ───────────────────────────────────────────
function setupEventListeners() {
    elements.newNoteBtn?.addEventListener('click', showNewNoteSection);
    elements.myNotesBtn?.addEventListener('click', showMyNotesSection);
    elements.textTabBtn?.addEventListener('click', showTextInput);
    elements.fileTabBtn?.addEventListener('click', showFileInput);
    elements.notesInput?.addEventListener('input', updateCharCounter);
    elements.fileUpload?.addEventListener('change', handleFileSelect);
    elements.summarizeBtn?.addEventListener('click', summarizeNotes);
    elements.copyBtn?.addEventListener('click', copySummary);
    elements.saveBtn?.addEventListener('click', saveNote);
    elements.addTagBtn?.addEventListener('click', addTagToNote);
    elements.newTagBtn?.addEventListener('click', () => elements.createTagModal?.classList.remove('hidden'));
    elements.createTagBtn?.addEventListener('click', createNewTag);
    elements.cancelTagBtn?.addEventListener('click', () => elements.createTagModal?.classList.add('hidden'));
    elements.newTagColor?.addEventListener('input', (e) => { if (elements.newTagColorHex) elements.newTagColorHex.value = e.target.value; });
    elements.newTagColorHex?.addEventListener('input', (e) => { if (elements.newTagColor) elements.newTagColor.value = e.target.value; });
    elements.searchInput?.addEventListener('input', debounce(filterNotes, 300));
    elements.tagFilter?.addEventListener('change', filterNotes);
    elements.closeModal?.addEventListener('click', closeNoteModal);
    elements.closeModalBtn?.addEventListener('click', closeNoteModal);
    elements.deleteNoteBtn?.addEventListener('click', deleteNote);
    elements.noteModal?.addEventListener('click', (e) => { if (e.target === elements.noteModal) closeNoteModal(); });
    elements.summaryTab?.addEventListener('click', () => showModalTab('summary'));
    elements.originalTab?.addEventListener('click', () => showModalTab('original'));
    elements.chatTab?.addEventListener('click', () => showModalTab('chat'));
    elements.sendChatBtn?.addEventListener('click', sendChatMessage);
    elements.chatInput?.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendChatMessage(); });
    elements.guestSendBtn?.addEventListener('click', sendGuestChatMessage);
    elements.guestChatInput?.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendGuestChatMessage(); });
}

// ── Navigation ────────────────────────────────────────────────
function showNewNoteSection() {
    elements.newNoteSection?.classList.remove('hidden');
    elements.myNotesSection?.classList.add('hidden');
}

function showMyNotesSection() {
    elements.myNotesSection?.classList.remove('hidden');
    elements.newNoteSection?.classList.add('hidden');
    if (isAuthenticated) loadNotes();
}

// ── Input tabs ────────────────────────────────────────────────
function showTextInput() {
    elements.textInput?.classList.remove('hidden');
    elements.fileInput?.classList.add('hidden');
    elements.textTabBtn?.classList.add('bg-primary-500', 'text-white');
    elements.textTabBtn?.classList.remove('text-slate-400', 'hover:bg-white/5');
    elements.fileTabBtn?.classList.remove('bg-primary-500', 'text-white');
    elements.fileTabBtn?.classList.add('text-slate-400', 'hover:bg-white/5');
}

function showFileInput() {
    elements.fileInput?.classList.remove('hidden');
    elements.textInput?.classList.add('hidden');
    elements.fileTabBtn?.classList.add('bg-primary-500', 'text-white');
    elements.fileTabBtn?.classList.remove('text-slate-400', 'hover:bg-white/5');
    elements.textTabBtn?.classList.remove('bg-primary-500', 'text-white');
    elements.textTabBtn?.classList.add('text-slate-400', 'hover:bg-white/5');
}

function updateCharCounter() {
    const count = elements.notesInput?.value.length ?? 0;
    if (elements.charCounter) elements.charCounter.textContent = count.toLocaleString();
    elements.charCounter?.classList.toggle('text-red-500', count > 50000);
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file && elements.fileName) elements.fileName.textContent = `Selected: ${file.name}`;
}

// ── Summarize ─────────────────────────────────────────────────
async function summarizeNotes() {
    hideError();
    elements.outputSection?.classList.add('hidden');
    elements.guestChatSection?.classList.add('hidden');
    elements.loading?.classList.remove('hidden');
    if (elements.summarizeBtn) elements.summarizeBtn.disabled = true;

    try {
        let response;
        if (!elements.fileInput?.classList.contains('hidden') && elements.fileUpload?.files.length > 0) {
            const formData = new FormData();
            formData.append('file', elements.fileUpload.files[0]);
            response = await fetch('/api/summarize', { method: 'POST', headers: csrfHeaders(), body: formData });
        } else {
            const notes = elements.notesInput?.value.trim();
            if (!notes) { showError('Please enter some notes to summarize'); return; }
            response = await fetch('/api/summarize', { method: 'POST', headers: jsonHeaders(), body: JSON.stringify({ notes }) });
        }

        const data = await response.json();

        if (!response.ok) {
            const msg = typeof data.error === 'object'
                ? Object.values(data.error).flat().join(' ')
                : (data.error || data.message || 'An error occurred');
            showError(msg);
            return;
        }

        guestSummary     = data.summary ?? '';
        guestNoteText    = elements.notesInput?.value.trim() ?? '';
        guestChatHistory = [];

        if (elements.summaryOutput) elements.summaryOutput.innerHTML = formatSummary(data.summary);
        elements.outputSection?.classList.remove('hidden');
        currentNoteId = data.note_id ?? null;

        if (isAuthenticated) {
            if (data.saved && currentNoteId) {
                loadSidebarNotes();
                elements.tagSection?.classList.remove('hidden');
            }
        } else {
            // Guest: show inline chat
            if (elements.guestChatMessages) elements.guestChatMessages.innerHTML = '';
            elements.guestChatSection?.classList.remove('hidden');
        }

    } catch (error) {
        showError('Network error. Please check your connection.');
        console.error(error);
    } finally {
        elements.loading?.classList.add('hidden');
        if (elements.summarizeBtn) elements.summarizeBtn.disabled = false;
    }
}

function formatSummary(text) {
    if (!text) return '';
    return text.split('\n').map(line => {
        line = line.trim();
        if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*'))
            return `<p class="ml-4 mb-2">• ${line.substring(1).trim()}</p>`;
        if (line.startsWith('#')) {
            const level = Math.min(line.match(/^#+/)[0].length, 6);
            return `<h${level} class="font-bold mt-4 mb-2">${line.replace(/^#+\s*/, '')}</h${level}>`;
        }
        return line ? `<p class="mb-2">${line}</p>` : '';
    }).join('');
}

async function copySummary() {
    try {
        await navigator.clipboard.writeText(elements.summaryOutput?.innerText ?? '');
        if (elements.copyBtn) {
            const orig = elements.copyBtn.innerHTML;
            elements.copyBtn.innerHTML = '✓ Copied!';
            elements.copyBtn.classList.add('bg-green-600');
            setTimeout(() => { elements.copyBtn.innerHTML = orig; elements.copyBtn.classList.remove('bg-green-600'); }, 2000);
        }
    } catch { showError('Failed to copy to clipboard'); }
}

async function saveNote() {
    if (isAuthenticated) elements.tagSection?.classList.remove('hidden');
    if (elements.saveBtn) {
        const orig = elements.saveBtn.innerHTML;
        elements.saveBtn.innerHTML = '✓ Saved!';
        elements.saveBtn.classList.add('bg-green-700');
        elements.saveBtn.disabled = true;
        setTimeout(() => {
            elements.saveBtn.innerHTML = orig;
            elements.saveBtn.classList.remove('bg-green-700');
            elements.saveBtn.disabled = false;
        }, 2000);
    }
}

// ── Tags ──────────────────────────────────────────────────────
async function loadTags() {
    try {
        const res  = await fetch('/api/tags');
        const data = await res.json();
        allTags = data.tags ?? [];
        if (elements.tagSelect) {
            elements.tagSelect.innerHTML = '<option value="">Select a tag...</option>';
            allTags.forEach(t => elements.tagSelect.add(new Option(t.name, t.id)));
        }
        if (elements.tagFilter) {
            elements.tagFilter.innerHTML = '<option value="">All Tags</option>';
            allTags.forEach(t => elements.tagFilter.add(new Option(t.name, t.id)));
        }
    } catch (e) { console.error('Error loading tags:', e); }
}

async function createNewTag() {
    const name  = elements.newTagName?.value.trim();
    const color = elements.newTagColorHex?.value ?? '#667eea';
    if (!name) { alert('Please enter a tag name'); return; }
    try {
        const res = await fetch('/api/tags', { method: 'POST', headers: jsonHeaders(), body: JSON.stringify({ name, color }) });
        if (!res.ok) { const d = await res.json(); alert(d.error || 'Failed to create tag'); return; }
        elements.createTagModal?.classList.add('hidden');
        if (elements.newTagName)     elements.newTagName.value     = '';
        if (elements.newTagColorHex) elements.newTagColorHex.value = '#667eea';
        if (elements.newTagColor)    elements.newTagColor.value    = '#667eea';
        await loadTags();
    } catch { alert('Network error. Please try again.'); }
}

async function addTagToNote() {
    const tagId = parseInt(elements.tagSelect?.value);
    if (!tagId || !currentNoteId) return;
    try {
        const res = await fetch(`/api/notes/${currentNoteId}/tags`, {
            method: 'POST', headers: jsonHeaders(), body: JSON.stringify({ tag_id: tagId })
        });
        if (!res.ok) { const d = await res.json(); alert(d.error || 'Failed to add tag'); return; }
        const noteData = await (await fetch(`/api/notes/${currentNoteId}`)).json();
        displayNoteTags(noteData.tags ?? []);
    } catch (e) { console.error('Error adding tag:', e); }
}

function displayNoteTags(tags) {
    if (!elements.selectedTags) return;
    elements.selectedTags.innerHTML = '';
    tags.forEach(tag => {
        const el = document.createElement('span');
        el.className = 'inline-flex items-center px-3 py-1 rounded-full text-sm';
        el.style.backgroundColor = tag.color + '33';
        el.style.color = tag.color;
        el.innerHTML = `${escapeHtml(tag.name)}<button onclick="removeTag(${tag.id})" class="ml-2 hover:text-red-400 text-xs">✕</button>`;
        elements.selectedTags.appendChild(el);
    });
}

async function removeTag(tagId) {
    if (!currentNoteId) return;
    try {
        await fetch(`/api/notes/${currentNoteId}/tags/${tagId}`, { method: 'DELETE', headers: csrfHeaders() });
        const noteData = await (await fetch(`/api/notes/${currentNoteId}`)).json();
        displayNoteTags(noteData.tags ?? []);
    } catch (e) { console.error('Error removing tag:', e); }
}

// ── Sidebar ───────────────────────────────────────────────────
async function loadSidebarNotes() {
    if (!isAuthenticated || !elements.sidebarNotesList) return;
    try {
        const data  = await (await fetch('/api/notes')).json();
        const notes = data.notes ?? [];
        elements.sidebarNotesList.innerHTML = '';
        if (!notes.length) {
            elements.sidebarNotesList.innerHTML = '<p class="text-xs text-slate-500 text-center py-6 px-2">No notes yet.</p>';
            return;
        }
        notes.forEach(note => {
            const item = document.createElement('button');
            item.className = 'sidebar-note-item w-full text-left px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors';
            item.innerHTML = `
                <p class="text-sm text-slate-300 truncate font-medium">${escapeHtml(note.title)}</p>
                <p class="text-xs text-slate-500 mt-0.5">${new Date(note.created_at).toLocaleDateString()}</p>
            `;
            item.addEventListener('click', () => openNoteModal(note.id));
            elements.sidebarNotesList.appendChild(item);
        });
    } catch (e) { console.error('Sidebar error:', e); }
}

// ── My Notes grid ─────────────────────────────────────────────
async function loadNotes() {
    if (!isAuthenticated) return;
    try {
        let url = '/api/notes?';
        if (elements.searchInput?.value) url += `search=${encodeURIComponent(elements.searchInput.value)}&`;
        if (elements.tagFilter?.value)   url += `tag_id=${encodeURIComponent(elements.tagFilter.value)}&`;
        const data = await (await fetch(url)).json();
        allNotes = data.notes ?? [];
        displayNotes(allNotes);
    } catch (e) { console.error('Error loading notes:', e); }
}

function displayNotes(notes) {
    if (!elements.notesGrid) return;
    elements.notesGrid.innerHTML = '';
    if (!notes.length) { elements.emptyState?.classList.remove('hidden'); return; }
    elements.emptyState?.classList.add('hidden');
    notes.forEach(note => elements.notesGrid.appendChild(createNoteCard(note)));
    initializeLucideIcons();
}

function createNoteCard(note) {
    const card    = document.createElement('div');
    const preview = (note.summary ?? '').replace(/<[^>]*>?/gm, '').substring(0, 120) + '...';
    const date    = new Date(note.created_at).toLocaleDateString();
    card.className = "group glass rounded-2xl p-6 hover:bg-white/5 transition-all cursor-pointer border border-white/5 hover:border-primary-500/30 hover:-translate-y-1 relative overflow-hidden";
    card.innerHTML = `
        <div class="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div class="relative z-10">
            <div class="flex justify-between items-start mb-3">
                <div class="p-2 bg-dark-800 rounded-lg text-primary-400"><i data-lucide="file-text" class="w-4 h-4"></i></div>
                <span class="text-xs text-slate-500 font-mono">${date}</span>
            </div>
            <h3 class="text-base font-bold text-white mb-2 line-clamp-1">${escapeHtml(note.title)}</h3>
            <p class="text-slate-400 text-sm mb-3 h-10 overflow-hidden">${preview}</p>
            <div class="flex gap-2 flex-wrap">
                ${(note.tags ?? []).map(t => `
                    <span class="px-2 py-0.5 rounded-md text-xs border border-white/5"
                        style="background-color:${t.color}22;color:${t.color}">
                        ${escapeHtml(t.name)}
                    </span>
                `).join('')}
            </div>
        </div>`;
    card.onclick = () => openNoteModal(note.id);
    return card;
}

function filterNotes() { loadNotes(); }

// ── Note Modal ────────────────────────────────────────────────
async function openNoteModal(noteId) {
    try {
        const res = await fetch(`/api/notes/${noteId}`);
        if (!res.ok) { alert('Failed to load note'); return; }
        const note = await res.json();

        currentNoteId = noteId;
        if (elements.modalTitle)     elements.modalTitle.textContent  = note.title ?? '';
        if (elements.summaryContent) elements.summaryContent.innerHTML = formatSummary(note.summary ?? '');
        if (elements.originalText)   elements.originalText.textContent = note.original_content ?? '';
        if (elements.modalTags) {
            elements.modalTags.innerHTML = (note.tags ?? []).map(t =>
                `<span class="px-3 py-1 rounded-full text-sm" style="background-color:${t.color}33;color:${t.color}">${escapeHtml(t.name)}</span>`
            ).join('');
        }

        await loadChatHistory(noteId);
        showModalTab('summary');
        elements.noteModal?.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    } catch (e) { console.error(e); alert('Failed to load note'); }
}

function closeNoteModal() {
    elements.noteModal?.classList.add('hidden');
    currentNoteId = null;
    document.body.style.overflow = '';
}

function showModalTab(tab) {
    [elements.summaryTab, elements.originalTab, elements.chatTab].forEach(btn => {
        btn?.classList.remove('bg-dark-700', 'text-white', 'shadow-sm');
        btn?.classList.add('text-slate-400');
    });
    [elements.summaryContent, elements.originalContent, elements.chatContent].forEach(c => c?.classList.add('hidden'));
    const map = {
        summary:  [elements.summaryTab,  elements.summaryContent],
        original: [elements.originalTab, elements.originalContent],
        chat:     [elements.chatTab,     elements.chatContent],
    };
    const [btn, content] = map[tab] ?? [];
    btn?.classList.add('bg-dark-700', 'text-white', 'shadow-sm');
    btn?.classList.remove('text-slate-400');
    content?.classList.remove('hidden');
}

// ── Auth Chat ─────────────────────────────────────────────────
async function loadChatHistory(noteId) {
    if (!elements.chatMessages) return;
    elements.chatMessages.innerHTML = '<p class="text-slate-500 text-center py-8 text-sm">Loading...</p>';
    try {
        const res = await fetch(`/api/notes/${noteId}/chat`);
        if (!res.ok) {
            elements.chatMessages.innerHTML = '<p class="text-red-400 text-center py-8 text-sm">Failed to load chat history.</p>';
            return;
        }
        const data = await res.json();
        elements.chatMessages.innerHTML = '';

        // FIX: safely handle null/undefined messages
        const msgs = Array.isArray(data.messages) ? data.messages : [];
        if (!msgs.length) {
            elements.chatMessages.innerHTML = '<p class="text-slate-400 text-center py-8 text-sm">No chat history yet. Ask a question!</p>';
            return;
        }
        msgs.forEach(msg => addChatMessage(msg.role, msg.content));
        elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
    } catch (e) {
        console.error('Error loading chat:', e);
        if (elements.chatMessages) elements.chatMessages.innerHTML = '<p class="text-red-400 text-center py-8 text-sm">Error loading chat.</p>';
    }
}

async function sendChatMessage() {
    const question = elements.chatInput?.value.trim();
    if (!question || !currentNoteId) return;

    if (elements.chatInput)   elements.chatInput.value     = '';
    if (elements.sendChatBtn) elements.sendChatBtn.disabled = true;

    addChatMessage('user', question);
    const loadingMsg = appendLoadingBubble(elements.chatMessages);

    try {
        // FIX: separate fetch from .json() so we can check res.ok first
        const res = await fetch(`/api/notes/${currentNoteId}/chat`, {
            method:  'POST',
            headers: jsonHeaders(),
            body:    JSON.stringify({ question }),
        });

        const data = await res.json();
        loadingMsg.remove();

        if (!res.ok) {
            const errMsg = typeof data.error === 'object'
                ? Object.values(data.error).flat().join(' ')
                : (data.error || data.message || 'Failed to send message');
            addChatMessage('assistant', `⚠️ ${errMsg}`);
            return;
        }

        // ChatController@send returns { response: "..." }
        addChatMessage('assistant', data.response ?? data.message ?? 'No response received.');

    } catch (e) {
        loadingMsg.remove();
        console.error('Chat error:', e);
        addChatMessage('assistant', '⚠️ Network error. Please try again.');
    } finally {
        if (elements.sendChatBtn) elements.sendChatBtn.disabled = false;
        if (elements.chatMessages) elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
    }
}

function addChatMessage(role, content) {
    const c = elements.chatMessages;
    if (!c) return;
    const d = document.createElement('div');
    d.className = `flex ${role === 'user' ? 'justify-end' : 'justify-start'} mb-3`;
    d.innerHTML = `
        <div class="${role === 'user' ? 'bg-primary-500' : 'bg-slate-700'} rounded-lg px-4 py-3 max-w-[80%]">
            <p class="text-sm whitespace-pre-wrap">${escapeHtml(content)}</p>
        </div>`;
    c.appendChild(d);
    c.scrollTop = c.scrollHeight;
}

// ── Guest Chat ────────────────────────────────────────────────
async function sendGuestChatMessage() {
    const question = elements.guestChatInput?.value.trim();
    if (!question || !guestSummary) return;

    if (elements.guestChatInput) elements.guestChatInput.value    = '';
    if (elements.guestSendBtn)   elements.guestSendBtn.disabled   = true;

    addGuestMsg('user', question);
    const loadingMsg = appendLoadingBubble(elements.guestChatMessages);

    try {
        const res = await fetch('/api/guest-chat', {
            method:  'POST',
            headers: jsonHeaders(),
            body:    JSON.stringify({
                question,
                note_text: guestNoteText,
                summary:   guestSummary,
                history:   guestChatHistory,
            }),
        });

        const data = await res.json();
        loadingMsg.remove();

        if (!res.ok) {
            addGuestMsg('assistant', `⚠️ ${data.error || 'Failed to get response.'}`);
            return;
        }

        const reply = data.response ?? 'No response received.';
        addGuestMsg('assistant', reply);
        guestChatHistory.push(
            { role: 'user',      content: question },
            { role: 'assistant', content: reply    }
        );
    } catch (e) {
        loadingMsg.remove();
        console.error('Guest chat error:', e);
        addGuestMsg('assistant', '⚠️ Network error. Please try again.');
    } finally {
        if (elements.guestSendBtn) elements.guestSendBtn.disabled = false;
        if (elements.guestChatMessages) elements.guestChatMessages.scrollTop = elements.guestChatMessages.scrollHeight;
    }
}

function addGuestMsg(role, content) {
    const c = elements.guestChatMessages;
    if (!c) return;
    const d = document.createElement('div');
    d.className = `flex ${role === 'user' ? 'justify-end' : 'justify-start'} mb-3`;
    d.innerHTML = `
        <div class="${role === 'user' ? 'bg-primary-500' : 'bg-slate-700'} rounded-lg px-4 py-2.5 max-w-[85%]">
            <p class="text-sm whitespace-pre-wrap">${escapeHtml(content)}</p>
        </div>`;
    c.appendChild(d);
    c.scrollTop = c.scrollHeight;
}

// ── Delete note ───────────────────────────────────────────────
async function deleteNote() {
    if (!currentNoteId || !confirm('Delete this note?')) return;
    try {
        const res = await fetch(`/api/notes/${currentNoteId}`, {
            method:  'DELETE',
            headers: csrfHeaders(),
        });
        if (!res.ok) { alert('Failed to delete note'); return; }
        closeNoteModal();
        // Refresh both sidebar and grid
        await Promise.all([loadSidebarNotes(), loadNotes()]);
    } catch { alert('Network error. Please try again.'); }
}

// ── Helpers ───────────────────────────────────────────────────
function appendLoadingBubble(container) {
    if (!container) return { remove: () => {} };
    const el = document.createElement('div');
    el.className = 'flex justify-start mb-3';
    el.innerHTML = `<div class="bg-slate-700 rounded-lg px-4 py-3"><div class="spinner" style="width:20px;height:20px;border-width:2px;"></div></div>`;
    container.appendChild(el);
    container.scrollTop = container.scrollHeight;
    return el;
}

// XSS prevention — always escape before inserting user content into innerHTML
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function showError(message) {
    if (elements.errorMessage) elements.errorMessage.textContent = message;
    elements.errorSection?.classList.remove('hidden');
    elements.loading?.classList.add('hidden');
}

function hideError() { elements.errorSection?.classList.add('hidden'); }

function debounce(func, wait) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => func(...args), wait); };
}
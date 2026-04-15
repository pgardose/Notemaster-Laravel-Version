// ── Auth state ────────────────────────────────────────────────
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
    newNoteBtn:           document.getElementById('newNoteBtn'),
    myNotesBtn:           document.getElementById('myNotesBtn'),
    newNoteSection:       document.getElementById('newNoteSection'),
    myNotesSection:       document.getElementById('myNotesSection'),
    textTabBtn:           document.getElementById('textTabBtn'),
    fileTabBtn:           document.getElementById('fileTabBtn'),
    textInput:            document.getElementById('textInput'),
    fileInput:            document.getElementById('fileInput'),
    notesInput:           document.getElementById('notesInput'),
    charCounter:          document.getElementById('charCounter'),
    fileUpload:           document.getElementById('fileUpload'),
    fileName:             document.getElementById('fileName'),
    summarizeBtn:         document.getElementById('summarizeBtn'),
    loading:              document.getElementById('loading'),
    errorSection:         document.getElementById('errorSection'),
    errorMessage:         document.getElementById('errorMessage'),
    outputSection:        document.getElementById('outputSection'),
    sideBySideBtn:        document.getElementById('sideBySideBtn'),
    summaryOnlyBtn:       document.getElementById('summaryOnlyBtn'),
    originalPanel:        document.getElementById('originalPanel'),
    summaryPanel:         document.getElementById('summaryPanel'),
    originalPanelText:    document.getElementById('originalPanelText'),
    summaryPanelText:     document.getElementById('summaryPanelText'),
    saveNoteBtn:          document.getElementById('saveNoteBtn'),
    copyBtn:              document.getElementById('copyBtn'),
    aiChatBtn:            document.getElementById('aiChatBtn'),
    tagSection:           document.getElementById('tagSection'),
    tagSelect:            document.getElementById('tagSelect'),
    addTagBtn:            document.getElementById('addTagBtn'),
    newTagBtn:            document.getElementById('newTagBtn'),
    selectedTags:         document.getElementById('selectedTags'),
    chatDrawer:           document.getElementById('chatDrawer'),
    chatDrawerOverlay:    document.getElementById('chatDrawerOverlay'),
    chatDrawerClose:      document.getElementById('chatDrawerClose'),
    chatDrawerTitle:      document.getElementById('chatDrawerTitle'),
    drawerMessages:       document.getElementById('drawerMessages'),
    drawerChatInput:      document.getElementById('drawerChatInput'),
    drawerSendBtn:        document.getElementById('drawerSendBtn'),
    searchInput:          document.getElementById('searchInput'),
    tagFilter:            document.getElementById('tagFilter'),
    notesGrid:            document.getElementById('notesGrid'),
    emptyState:           document.getElementById('emptyState'),
    sidebarNotesList:     document.getElementById('sidebarNotesList'),
    noteModal:            document.getElementById('noteModal'),
    modalTitle:           document.getElementById('modalTitle'),
    modalTags:            document.getElementById('modalTags'),
    closeModal:           document.getElementById('closeModal'),
    closeModalBtn:        document.getElementById('closeModalBtn'),
    deleteNoteBtn:        document.getElementById('deleteNoteBtn'),
    modalSideBySideBtn:   document.getElementById('modalSideBySideBtn'),
    modalSummaryOnlyBtn:  document.getElementById('modalSummaryOnlyBtn'),
    modalOriginalPanel:   document.getElementById('modalOriginalPanel'),
    modalOriginalText:    document.getElementById('modalOriginalText'),
    modalSummaryContent:  document.getElementById('modalSummaryContent'),
    modalAiChatBtn:       document.getElementById('modalAiChatBtn'),
    modalCopyBtn:         document.getElementById('modalCopyBtn'),
    createTagModal:       document.getElementById('createTagModal'),
    newTagName:           document.getElementById('newTagName'),
    newTagColor:          document.getElementById('newTagColor'),
    newTagColorHex:       document.getElementById('newTagColorHex'),
    createTagBtn:         document.getElementById('createTagBtn'),
    cancelTagBtn:         document.getElementById('cancelTagBtn'),
};

// ── Initialize ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    if (isAuthenticated) { loadTags(); loadSidebarNotes(); }
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
    elements.sideBySideBtn?.addEventListener('click', () => setViewMode('side-by-side', false));
    elements.summaryOnlyBtn?.addEventListener('click', () => setViewMode('summary-only', false));
    elements.saveNoteBtn?.addEventListener('click', saveNote);
    elements.copyBtn?.addEventListener('click', copySummary);
    elements.aiChatBtn?.addEventListener('click', () => openChatDrawer('guest'));
    elements.modalSideBySideBtn?.addEventListener('click', () => setViewMode('side-by-side', true));
    elements.modalSummaryOnlyBtn?.addEventListener('click', () => setViewMode('summary-only', true));
    elements.modalAiChatBtn?.addEventListener('click', () => openChatDrawer('auth'));
    elements.modalCopyBtn?.addEventListener('click', copyModalSummary);
    elements.closeModal?.addEventListener('click', closeNoteModal);
    elements.closeModalBtn?.addEventListener('click', closeNoteModal);
    elements.deleteNoteBtn?.addEventListener('click', deleteNote);
    elements.noteModal?.addEventListener('click', (e) => { if (e.target === elements.noteModal) closeNoteModal(); });
    elements.chatDrawerClose?.addEventListener('click', closeChatDrawer);
    elements.chatDrawerOverlay?.addEventListener('click', closeChatDrawer);
    elements.drawerSendBtn?.addEventListener('click', sendDrawerMessage);
    elements.drawerChatInput?.addEventListener('keypress', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendDrawerMessage(); } });
    elements.addTagBtn?.addEventListener('click', addTagToNote);
    elements.newTagBtn?.addEventListener('click', () => elements.createTagModal?.classList.remove('hidden'));
    elements.createTagBtn?.addEventListener('click', createNewTag);
    elements.cancelTagBtn?.addEventListener('click', () => elements.createTagModal?.classList.add('hidden'));
    elements.newTagColor?.addEventListener('input', (e) => { if (elements.newTagColorHex) elements.newTagColorHex.value = e.target.value; });
    elements.newTagColorHex?.addEventListener('input', (e) => { if (elements.newTagColor) elements.newTagColor.value = e.target.value; });
    elements.searchInput?.addEventListener('input', debounce(filterNotes, 300));
    elements.tagFilter?.addEventListener('change', filterNotes);

    
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

// ── Input Tabs ────────────────────────────────────────────────
function showTextInput() {
    elements.textInput?.classList.remove('hidden');
    elements.fileInput?.classList.add('hidden');
    elements.textTabBtn?.classList.add('bg-white', 'text-slate-700', 'shadow-sm');
    elements.textTabBtn?.classList.remove('text-slate-500');
    elements.fileTabBtn?.classList.remove('bg-white', 'text-slate-700', 'shadow-sm');
    elements.fileTabBtn?.classList.add('text-slate-500');
}
function showFileInput() {
    elements.fileInput?.classList.remove('hidden');
    elements.textInput?.classList.add('hidden');
    elements.fileTabBtn?.classList.add('bg-white', 'text-slate-700', 'shadow-sm');
    elements.fileTabBtn?.classList.remove('text-slate-500');
    elements.textTabBtn?.classList.remove('bg-white', 'text-slate-700', 'shadow-sm');
    elements.textTabBtn?.classList.add('text-slate-500');
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

// ── View Mode Toggle ──────────────────────────────────────────
function setViewMode(mode, isModal) {
    const sideBtn      = isModal ? elements.modalSideBySideBtn  : elements.sideBySideBtn;
    const summaryBtn   = isModal ? elements.modalSummaryOnlyBtn : elements.summaryOnlyBtn;
    const origPanel    = isModal ? elements.modalOriginalPanel  : elements.originalPanel;
    const summaryPanel = isModal ? null                         : elements.summaryPanel;
    const isSide       = mode === 'side-by-side';

    sideBtn?.classList.toggle('active-tab',    isSide);
    sideBtn?.classList.toggle('inactive-tab',  !isSide);
    summaryBtn?.classList.toggle('active-tab',  !isSide);
    summaryBtn?.classList.toggle('inactive-tab', isSide);

    if (isSide) {
        origPanel?.classList.remove('hidden');
        summaryPanel?.classList.remove('lg:w-full');
    } else {
        origPanel?.classList.add('hidden');
        summaryPanel?.classList.add('lg:w-full');
    }
}

// ── Summarize ─────────────────────────────────────────────────
async function summarizeNotes() {
    hideError();
    elements.outputSection?.classList.add('hidden');
    elements.loading?.classList.remove('hidden');
    if (elements.summarizeBtn) elements.summarizeBtn.disabled = true;

    // ✅ FIX: track whether we used file mode and which file was selected
    const isFileMode = !elements.fileInput?.classList.contains('hidden');
    const selectedFile = isFileMode ? elements.fileUpload?.files[0] : null;

    try {
        let response;
        if (isFileMode && selectedFile) {
            const formData = new FormData();
            formData.append('file', selectedFile);
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
            showError(msg); return;
        }

        guestSummary     = data.summary ?? '';
        guestChatHistory = [];
        currentNoteId    = data.note_id ?? null;

        // ✅ FIX: populate original panel correctly for both text and file modes
        if (isFileMode && selectedFile) {
            // For file uploads: show the filename as a placeholder since we don't
            // get the extracted text back from the API. If you want the full text,
            // add original_content to your API response.
            guestNoteText = `[File: ${selectedFile.name}]\n\nText was extracted from this file for summarization.`;
        } else {
            guestNoteText = elements.notesInput?.value.trim() ?? '';
        }

        if (elements.originalPanelText) elements.originalPanelText.textContent = guestNoteText;
        if (elements.summaryPanelText)  elements.summaryPanelText.innerHTML    = formatSummary(data.summary);

        elements.outputSection?.classList.remove('hidden');
        setViewMode('side-by-side', false);

        if (isAuthenticated && data.saved) {
            elements.tagSection?.classList.remove('hidden');
            loadSidebarNotes();
        }
        if (elements.saveNoteBtn) {
            elements.saveNoteBtn.style.display = isAuthenticated ? '' : 'none';
        }

    } catch (error) {
        showError('Network error. Please check your connection.');
        console.error(error);
    } finally {
        elements.loading?.classList.add('hidden');
        if (elements.summarizeBtn) elements.summarizeBtn.disabled = false;
    }
}

// ── Format summary ────────────────────────────────────────────
function formatSummary(text) {
    if (!text) return '';
    return text.split('\n').map(line => {
        line = line.trim();
        if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*'))
            return `<p class="flex gap-2 mb-2 text-slate-600"><span class="text-primary-500 shrink-0">•</span><span>${line.substring(1).trim()}</span></p>`;
        if (line.startsWith('#')) {
            const level = Math.min(line.match(/^#+/)[0].length, 6);
            return `<h${level} class="font-semibold text-slate-800 mt-4 mb-2 text-sm uppercase tracking-wider">${line.replace(/^#+\s*/, '')}</h${level}>`;
        }
        return line ? `<p class="mb-2 text-slate-600 leading-relaxed">${line}</p>` : '';
    }).join('');
}

async function copySummary() {
    await copyToClipboard(elements.summaryPanelText?.innerText ?? '', elements.copyBtn);
}
async function copyModalSummary() {
    await copyToClipboard(elements.modalSummaryContent?.innerText ?? '', elements.modalCopyBtn);
}
async function copyToClipboard(text, btn) {
    try {
        await navigator.clipboard.writeText(text);
        if (btn) {
            const orig = btn.innerHTML;
            btn.innerHTML = `<i data-lucide="check" class="w-4 h-4"></i>`;
            lucide?.createIcons();
            setTimeout(() => { btn.innerHTML = orig; lucide?.createIcons(); }, 2000);
        }
    } catch { showError('Failed to copy'); }
}

async function saveNote() {
    if (!isAuthenticated) return;
    elements.tagSection?.classList.remove('hidden');
    if (elements.saveNoteBtn) {
        const orig = elements.saveNoteBtn.innerHTML;
        elements.saveNoteBtn.innerHTML = `<i data-lucide="check" class="w-4 h-4 mr-2 inline"></i> Saved!`;
        lucide?.createIcons();
        elements.saveNoteBtn.disabled = true;
        setTimeout(() => { elements.saveNoteBtn.innerHTML = orig; lucide?.createIcons(); elements.saveNoteBtn.disabled = false; }, 2000);
    }
}

// ── Chat Drawer ───────────────────────────────────────────────
function openChatDrawer(mode) {
    const drawer = elements.chatDrawer;
    if (!drawer) return;
    if (elements.chatDrawerTitle) elements.chatDrawerTitle.textContent = mode === 'auth' ? 'Chat with Note' : 'Ask AI';
    drawer.dataset.mode = mode;
    drawer.classList.remove('translate-x-full');
    elements.chatDrawerOverlay?.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    if (mode === 'auth' && currentNoteId) {
        loadDrawerChatHistory(currentNoteId);
    } else {
        if (elements.drawerMessages) elements.drawerMessages.innerHTML = `<p class="text-slate-400 text-center py-10 text-sm">Ask anything about your summary!</p>`;
    }
    setTimeout(() => elements.drawerChatInput?.focus(), 300);
}

function closeChatDrawer() {
    elements.chatDrawer?.classList.add('translate-x-full');
    elements.chatDrawerOverlay?.classList.add('hidden');
    document.body.style.overflow = '';
}

async function loadDrawerChatHistory(noteId) {
    if (!elements.drawerMessages) return;
    elements.drawerMessages.innerHTML = `<p class="text-slate-400 text-center py-10 text-sm">Loading...</p>`;
    try {
        const res  = await fetch(`/api/notes/${noteId}/chat`);
        if (!res.ok) { elements.drawerMessages.innerHTML = `<p class="text-red-400 text-center py-10 text-sm">Failed to load history.</p>`; return; }
        const data = await res.json();
        elements.drawerMessages.innerHTML = '';
        const msgs = Array.isArray(data.messages) ? data.messages : [];
        if (!msgs.length) { elements.drawerMessages.innerHTML = `<p class="text-slate-400 text-center py-10 text-sm">No chat history yet. Ask a question!</p>`; return; }
        msgs.forEach(msg => addDrawerMessage(msg.role, msg.content));
        elements.drawerMessages.scrollTop = elements.drawerMessages.scrollHeight;
    } catch (e) {
        console.error(e);
        elements.drawerMessages.innerHTML = `<p class="text-red-400 text-center py-10 text-sm">Error loading chat.</p>`;
    }
}

async function sendDrawerMessage() {
    const question = elements.drawerChatInput?.value.trim();
    if (!question) return;
    const mode = elements.chatDrawer?.dataset.mode;
    if (elements.drawerChatInput)  elements.drawerChatInput.value  = '';
    if (elements.drawerSendBtn)    elements.drawerSendBtn.disabled = true;

    const placeholder = elements.drawerMessages?.querySelector('p');
    if (placeholder && !placeholder.closest('.msg-bubble')) placeholder.remove();

    addDrawerMessage('user', question);
    const bubble = appendLoadingBubble(elements.drawerMessages);

    try {
        let res, data;
        if (mode === 'auth' && currentNoteId) {
            res  = await fetch(`/api/notes/${currentNoteId}/chat`, { method: 'POST', headers: jsonHeaders(), body: JSON.stringify({ question }) });
            data = await res.json();
            bubble.remove();
            if (!res.ok) { addDrawerMessage('assistant', `⚠️ ${data.error || 'Error'}`); return; }
            addDrawerMessage('assistant', data.response ?? 'No response.');
        } else {
            res  = await fetch('/api/guest-chat', { method: 'POST', headers: jsonHeaders(),
                body: JSON.stringify({ question, note_text: guestNoteText, summary: guestSummary, history: guestChatHistory }) });
            data = await res.json();
            bubble.remove();
            if (!res.ok) { addDrawerMessage('assistant', `⚠️ ${data.error || 'Error'}`); return; }
            const reply = data.response ?? 'No response.';
            addDrawerMessage('assistant', reply);
            guestChatHistory.push({ role: 'user', content: question }, { role: 'assistant', content: reply });
        }
    } catch (e) {
        bubble.remove();
        console.error(e);
        addDrawerMessage('assistant', '⚠️ Network error.');
    } finally {
        if (elements.drawerSendBtn) elements.drawerSendBtn.disabled = false;
        if (elements.drawerMessages) elements.drawerMessages.scrollTop = elements.drawerMessages.scrollHeight;
    }
}

// ✅ Light mode chat bubbles
function addDrawerMessage(role, content) {
    const c = elements.drawerMessages;
    if (!c) return;
    const d = document.createElement('div');
    d.className = `msg-bubble flex ${role === 'user' ? 'justify-end' : 'justify-start'} mb-3`;
    d.innerHTML = `
        <div class="${role === 'user'
            ? 'bg-primary-500 text-white'
            : 'bg-white border border-slate-200 text-slate-700 shadow-sm'
        } rounded-2xl px-4 py-3 max-w-[85%]">
            <p class="text-sm whitespace-pre-wrap leading-relaxed">${escapeHtml(content)}</p>
        </div>`;
    c.appendChild(d);
    c.scrollTop = c.scrollHeight;
}

// ── Tags ──────────────────────────────────────────────────────
async function loadTags() {
    try {
        const data = await (await fetch('/api/tags')).json();
        allTags = data.tags ?? [];
        if (elements.tagSelect) { elements.tagSelect.innerHTML = '<option value="">Select a tag...</option>'; allTags.forEach(t => elements.tagSelect.add(new Option(t.name, t.id))); }
        if (elements.tagFilter) { elements.tagFilter.innerHTML = '<option value="">All Tags</option>'; allTags.forEach(t => elements.tagFilter.add(new Option(t.name, t.id))); }
    } catch (e) { console.error('Error loading tags:', e); }
}
async function createNewTag() {
    const name  = elements.newTagName?.value.trim();
    const color = elements.newTagColorHex?.value ?? '#6366f1';
    if (!name) { alert('Please enter a tag name'); return; }
    try {
        const res = await fetch('/api/tags', { method: 'POST', headers: jsonHeaders(), body: JSON.stringify({ name, color }) });
        if (!res.ok) { const d = await res.json(); alert(d.error || 'Failed to create tag'); return; }
        elements.createTagModal?.classList.add('hidden');
        if (elements.newTagName) elements.newTagName.value = '';
        if (elements.newTagColorHex) elements.newTagColorHex.value = '#6366f1';
        if (elements.newTagColor) elements.newTagColor.value = '#6366f1';
        await loadTags();
    } catch { alert('Network error.'); }
}
async function addTagToNote() {
    const tagId = parseInt(elements.tagSelect?.value);
    if (!tagId || !currentNoteId) return;
    try {
        const res = await fetch(`/api/notes/${currentNoteId}/tags`, { method: 'POST', headers: jsonHeaders(), body: JSON.stringify({ tag_id: tagId }) });
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
        el.className = 'inline-flex items-center px-3 py-1 rounded-full text-sm border';
        el.style.backgroundColor = tag.color + '18';
        el.style.color = tag.color;
        el.style.borderColor = tag.color + '40';
        el.innerHTML = `${escapeHtml(tag.name)}<button onclick="removeTag(${tag.id})" class="ml-2 hover:opacity-70 text-xs">✕</button>`;
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
        if (!notes.length) { elements.sidebarNotesList.innerHTML = '<p class="text-xs text-slate-400 text-center py-6 px-2">No notes yet.</p>'; return; }
        notes.forEach(note => {
            const item = document.createElement('button');
            item.className = 'sidebar-note-item w-full text-left px-3 py-2.5';
            item.innerHTML = `<p class="text-sm text-slate-700 truncate font-medium">${escapeHtml(note.title)}</p><p class="text-xs text-slate-400 mt-0.5">${new Date(note.created_at).toLocaleDateString()}</p>`;
            item.addEventListener('click', () => openNoteModal(note.id));
            elements.sidebarNotesList.appendChild(item);
        });
    } catch (e) { console.error('Sidebar error:', e); }
}

// ── My Notes Grid ─────────────────────────────────────────────
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
    card.className = 'note-card p-5';
    card.innerHTML = `
        <div class="flex justify-between items-start mb-3">
            <div class="p-2 bg-indigo-50 rounded-lg text-primary-500">
                <i data-lucide="file-text" class="w-4 h-4"></i>
            </div>
            <span class="text-xs text-slate-400 font-mono">${date}</span>
        </div>
        <h3 class="text-base font-bold text-slate-800 mb-2 line-clamp-1">${escapeHtml(note.title)}</h3>
        <p class="text-slate-500 text-sm mb-3 h-10 overflow-hidden">${preview}</p>
        <div class="flex gap-2 flex-wrap">
            ${(note.tags ?? []).map(t => `<span class="px-2 py-0.5 rounded-md text-xs border" style="background-color:${t.color}18;color:${t.color};border-color:${t.color}40">${escapeHtml(t.name)}</span>`).join('')}
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
        if (elements.modalTitle)         elements.modalTitle.textContent         = note.title ?? '';
        if (elements.modalSummaryContent) elements.modalSummaryContent.innerHTML  = formatSummary(note.summary ?? '');
        if (elements.modalOriginalText)  elements.modalOriginalText.textContent   = note.original_content ?? '';
        if (elements.modalTags) {
            elements.modalTags.innerHTML = (note.tags ?? []).map(t =>
                `<span class="px-3 py-1 rounded-full text-xs border" style="background-color:${t.color}18;color:${t.color};border-color:${t.color}40">${escapeHtml(t.name)}</span>`
            ).join('');
        }
        setViewMode('side-by-side', true);
        elements.noteModal?.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    } catch (e) { console.error(e); alert('Failed to load note'); }
}
function closeNoteModal() {
    // If quiz is open, clean it up first
    if (quizEl.container && !quizEl.container.classList.contains('hidden')) {
        exitQuiz();
    }
    elements.noteModal?.classList.add('hidden');
    currentNoteId = null;
    document.body.style.overflow = '';
    closeChatDrawer();
}
async function deleteNote() {
    if (!currentNoteId || !confirm('Delete this note?')) return;
    try {
        const res = await fetch(`/api/notes/${currentNoteId}`, { method: 'DELETE', headers: csrfHeaders() });
        if (!res.ok) { alert('Failed to delete note'); return; }
        closeNoteModal();
        await Promise.all([loadSidebarNotes(), loadNotes()]);
    } catch { alert('Network error.'); }
}

// ── Helpers ───────────────────────────────────────────────────
function appendLoadingBubble(container) {
    if (!container) return { remove: () => {} };
    const el = document.createElement('div');
    el.className = 'flex justify-start mb-3';
    el.innerHTML = `<div class="bg-white border border-slate-200 rounded-2xl px-5 py-3.5 flex gap-1.5 items-center shadow-sm">
        <span class="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style="animation-delay:0ms"></span>
        <span class="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style="animation-delay:150ms"></span>
        <span class="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style="animation-delay:300ms"></span>
    </div>`;
    container.appendChild(el);
    container.scrollTop = container.scrollHeight;
    return el;
}
function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}
function showError(message) {
    if (elements.errorMessage) elements.errorMessage.textContent = message;
    elements.errorSection?.classList.remove('hidden');
    elements.loading?.classList.add('hidden');
}
function hideError() { elements.errorSection?.classList.add('hidden'); }
function debounce(func, wait) { let t; return (...args) => { clearTimeout(t); t = setTimeout(() => func(...args), wait); }; }

// ════════════════════════════════════════════════════════════
//  QUIZ ENGINE
// ════════════════════════════════════════════════════════════

// ── Quiz state ────────────────────────────────────────────────
const quiz = {
    questions:       [],   // parsed JSON from API
    currentIndex:    0,    // which question we're on
    score:           0,    // correct answers
    answered:        false, // has user picked an answer for current Q
};

// ── Quiz DOM refs ─────────────────────────────────────────────
const quizEl = {
    container:    document.getElementById('quizContainer'),
    panels:       document.querySelector('.flex.gap-4.p-6'),  // the original side-by-side panels div
    generateBtn:  document.getElementById('generateQuizBtn'),
    closeBtn:     document.getElementById('closeQuizBtn'),
    exitBtn:      document.getElementById('quizExitBtn'),
    retryBtn:     document.getElementById('quizRetryBtn'),
    nextBtn:      document.getElementById('quizNextBtn'),
    progress:     document.getElementById('quizProgress'),
    progressBar:  document.getElementById('quizProgressBar'),
    questionText: document.getElementById('quizQuestionText'),
    optionsDiv:   document.getElementById('quizOptions'),
    questionCard: document.getElementById('quizQuestionCard'),
    scoreCard:    document.getElementById('quizScoreCard'),
    scoreText:    document.getElementById('quizScoreText'),
    scoreSubtext: document.getElementById('quizScoreSubtext'),
    scoreIcon:    document.getElementById('quizScoreIcon'),
};

// ── Wire up events ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    quizEl.generateBtn?.addEventListener('click', handleGenerateQuiz);
    quizEl.closeBtn?.addEventListener('click', exitQuiz);
    quizEl.exitBtn?.addEventListener('click', exitQuiz);
    quizEl.retryBtn?.addEventListener('click', startQuiz);
    quizEl.nextBtn?.addEventListener('click', nextQuestion);
});

// ── Generate quiz (API call) ──────────────────────────────────
async function handleGenerateQuiz() {
    if (!currentNoteId) return;

    // Loading state on button — toggle icon/spinner/label elements
    const btn = quizEl.generateBtn;
    btn.disabled = true;
    document.getElementById('quizBtnIcon')?.classList.add('hidden');
    document.getElementById('quizBtnSpinner')?.classList.remove('hidden');
    const quizBtnLabel = document.getElementById('quizBtnLabel');
    if (quizBtnLabel) quizBtnLabel.textContent = 'Generating…';

    try {
        const res  = await fetch(`/api/notes/${currentNoteId}/quiz`, {
            method: 'POST',
            headers: jsonHeaders(),
        });
        const data = await res.json();

        if (!res.ok) {
            alert(data.error || 'Failed to generate quiz. Please try again.');
            return;
        }

        // Store questions and launch
        quiz.questions = Array.isArray(data) ? data : (data.quiz ?? []);
        if (!quiz.questions.length) { alert("No questions returned. Please try again."); return; }
        startQuiz();

    } catch (e) {
        console.error('Quiz error:', e);
        alert('Network error. Please check your connection.');
    } finally {
        btn.disabled = false;
        document.getElementById('quizBtnIcon')?.classList.remove('hidden');
        document.getElementById('quizBtnSpinner')?.classList.add('hidden');
        const lbl = document.getElementById('quizBtnLabel');
        if (lbl) lbl.textContent = 'Generate Quiz';
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}

// ── Show quiz UI, hide note panels ───────────────────────────
function startQuiz() {
    quiz.currentIndex = 0;
    quiz.score        = 0;
    quiz.answered     = false;

    // Hide the original panels area, show quiz
    hidePanelsShowQuiz(true);

    // Show question card, hide score card
    quizEl.questionCard?.classList.remove('hidden');
    quizEl.scoreCard?.classList.add('hidden');

    renderQuestion();
}

function hidePanelsShowQuiz(show) {
    // Hide/show the side-by-side panels area
    const panelsWrapper = document.getElementById('modalOriginalPanel')?.closest('.flex.gap-4');
    if (panelsWrapper) panelsWrapper.style.display = show ? 'none' : '';

    // Hide/show the view toggle bar (Side-by-Side / Summary Only)
    const viewToggleBar = document.getElementById('modalViewToggleBar');
    if (viewToggleBar) viewToggleBar.style.display = show ? 'none' : '';

    // Hide/show the Generate Quiz + AI Chat buttons in the footer
    const quizChatBtns = document.getElementById('modalQuizChatBtns');
    if (quizChatBtns) quizChatBtns.style.display = show ? 'none' : '';

    // Show/hide the quiz container itself
    if (quizEl.container) {
        if (show) {
            quizEl.container.classList.remove('hidden');
            quizEl.container.style.display = 'flex';
            quizEl.container.style.flexDirection = 'column';
        } else {
            quizEl.container.classList.add('hidden');
            quizEl.container.style.display = '';
        }
    }
}

function exitQuiz() {
    hidePanelsShowQuiz(false);
    quizEl.nextBtn?.classList.add('hidden');
    quiz.questions   = [];
    quiz.currentIndex = 0;
    quiz.score       = 0;
}

// ── Render current question ───────────────────────────────────
function renderQuestion() {
    const q = quiz.questions[quiz.currentIndex];
    if (!q) return;

    quiz.answered = false;

    // Progress
    const num   = quiz.currentIndex + 1;
    const total = quiz.questions.length;
    if (quizEl.progress)    quizEl.progress.textContent = `Question ${num} of ${total}`;
    if (quizEl.progressBar) quizEl.progressBar.style.width = `${((num - 1) / total) * 100}%`;

    // Question text
    if (quizEl.questionText) quizEl.questionText.textContent = `${num}. ${q.question}`;

    // Options
    if (!quizEl.optionsDiv) return;
    quizEl.optionsDiv.innerHTML = '';
    quizEl.nextBtn?.classList.add('hidden');

        q.options.forEach((option) => {
        const btn = document.createElement('button');
        btn.className = [
            'w-full text-left px-5 py-4 rounded-xl border-2 border-slate-200',
            'bg-white text-slate-700 text-sm font-medium',
            'hover:border-violet-300 hover:bg-violet-50',
            'transition-all duration-200 cursor-pointer quiz-option',
        ].join(' ');
        btn.textContent = option;
        btn.addEventListener('click', () => {
            // "Selected" active state — highlight before answer is revealed
            if (!quiz.answered) {
                quizEl.optionsDiv.querySelectorAll('.quiz-option').forEach(b => {
                    b.classList.remove(
                        'bg-violet-100', 'border-violet-500', 'ring-2', 'ring-violet-200', 'text-violet-800'
                    );
                    b.classList.add('bg-white', 'border-slate-200', 'text-slate-700');
                });
                btn.classList.remove('bg-white', 'border-slate-200', 'text-slate-700');
                btn.classList.add(
                    'bg-violet-100', 'border-violet-500', 'ring-2', 'ring-violet-200', 'text-violet-800'
                );
            }
            handleAnswer(btn, option, q.answer);
        });
        quizEl.optionsDiv.appendChild(btn);
    });

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ── Handle answer selection ───────────────────────────────────
function handleAnswer(clickedBtn, selected, correct) {
    if (quiz.answered) return;  // prevent double-clicking
    quiz.answered = true;

    const isCorrect = selected === correct;
    if (isCorrect) quiz.score++;

    // Style all options
    const allOptions = quizEl.optionsDiv?.querySelectorAll('.quiz-option');
    allOptions?.forEach(btn => {
        btn.disabled = true;
        const text = btn.textContent;

        if (text === correct) {
            // Always highlight the correct answer in teal
            btn.className = btn.className
                .replace(/border-slate-200|border-violet-400/g, 'border-teal-500')
                .replace(/bg-white|bg-violet-50/g, 'bg-teal-50')
                .replace(/text-slate-700/g, 'text-teal-800');
            btn.innerHTML = `${escapeHtml(text)} <span class="float-right text-teal-600 font-bold">✓</span>`;
        } else if (text === selected && !isCorrect) {
            // Wrong answer — red
            btn.className = btn.className
                .replace(/border-slate-200|border-violet-400/g, 'border-red-400')
                .replace(/bg-white|bg-violet-50/g, 'bg-red-50')
                .replace(/text-slate-700/g, 'text-red-700');
            btn.innerHTML = `${escapeHtml(text)} <span class="float-right text-red-500 font-bold">✗</span>`;
        }
    });

    // Show Next / Finish button
    if (quizEl.nextBtn) {
        quizEl.nextBtn.classList.remove('hidden');
        const isLast = quiz.currentIndex >= quiz.questions.length - 1;
        quizEl.nextBtn.innerHTML = isLast
            ? `See Results <i data-lucide="bar-chart-2" class="w-4 h-4 inline ml-1"></i>`
            : `Next Question <i data-lucide="arrow-right" class="w-4 h-4 inline ml-1"></i>`;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}

// ── Advance to next question or show score ────────────────────
function nextQuestion() {
    if (!quiz.answered) return;

    quiz.currentIndex++;

    if (quiz.currentIndex >= quiz.questions.length) {
        showScore();
    } else {
        renderQuestion();
    }
}

// ── Final score screen ────────────────────────────────────────
function showScore() {
    // Update progress bar to 100%
    if (quizEl.progressBar) quizEl.progressBar.style.width = '100%';
    if (quizEl.progress)    quizEl.progress.textContent = 'Complete!';

    quizEl.questionCard?.classList.add('hidden');
    quizEl.scoreCard?.classList.remove('hidden');
    quizEl.nextBtn?.classList.add('hidden');

    const total   = quiz.questions.length;
    const score   = quiz.score;
    const percent = Math.round((score / total) * 100);

    // Score text
    if (quizEl.scoreText) {
        quizEl.scoreText.textContent = `You scored ${score} out of ${total} (${percent}%)`;
    }

    // Motivational subtext + emoji based on score
    let emoji = '😅';
    let msg   = 'Keep studying — you\'ll get there!';

    if (percent === 100) { emoji = '🏆'; msg = 'Perfect score! Outstanding work!'; }
    else if (percent >= 80) { emoji = '🎉'; msg = 'Great job! You know this material well.'; }
    else if (percent >= 60) { emoji = '👍'; msg = 'Good effort! Review the missed questions.'; }
    else if (percent >= 40) { emoji = '📚'; msg = 'Keep studying — you\'re getting there!'; }

    if (quizEl.scoreIcon)    quizEl.scoreIcon.textContent    = emoji;
    if (quizEl.scoreSubtext) quizEl.scoreSubtext.textContent = msg;

    if (typeof lucide !== 'undefined') lucide.createIcons();
}
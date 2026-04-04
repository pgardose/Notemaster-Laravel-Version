// State management
let currentNoteId = null;
let allNotes = [];
let allTags = [];

// ─── CSRF Token (Laravel requirement) ────────────────────────────────────────
const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';

// Helper: build headers for JSON requests
function jsonHeaders() {
    return {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken,
    };
}

// Helper: build headers for fetch requests that need CSRF but no Content-Type
// (e.g. DELETE with no body, or FormData uploads)
function csrfHeaders() {
    return {
        'X-CSRF-TOKEN': csrfToken,
    };
}
// ─────────────────────────────────────────────────────────────────────────────

// DOM Elements
const elements = {
    // Navigation
    newNoteBtn: document.getElementById('newNoteBtn'),
    myNotesBtn: document.getElementById('myNotesBtn'),
    
    // Sections
    newNoteSection: document.getElementById('newNoteSection'),
    myNotesSection: document.getElementById('myNotesSection'),
    
    // Input tabs
    textTabBtn: document.getElementById('textTabBtn'),
    fileTabBtn: document.getElementById('fileTabBtn'),
    textInput: document.getElementById('textInput'),
    fileInput: document.getElementById('fileInput'),
    
    // Input elements
    notesInput: document.getElementById('notesInput'),
    charCounter: document.getElementById('charCounter'),
    fileUpload: document.getElementById('fileUpload'),
    fileName: document.getElementById('fileName'),
    
    // Buttons
    summarizeBtn: document.getElementById('summarizeBtn'),
    copyBtn: document.getElementById('copyBtn'),
    saveBtn: document.getElementById('saveBtn'),
    
    // Output
    outputSection: document.getElementById('outputSection'),
    summaryOutput: document.getElementById('summaryOutput'),
    loading: document.getElementById('loading'),
    errorSection: document.getElementById('errorSection'),
    errorMessage: document.getElementById('errorMessage'),
    
    // Tags
    tagSection: document.getElementById('tagSection'),
    tagSelect: document.getElementById('tagSelect'),
    addTagBtn: document.getElementById('addTagBtn'),
    newTagBtn: document.getElementById('newTagBtn'),
    selectedTags: document.getElementById('selectedTags'),
    
    // My Notes
    searchInput: document.getElementById('searchInput'),
    tagFilter: document.getElementById('tagFilter'),
    notesGrid: document.getElementById('notesGrid'),
    emptyState: document.getElementById('emptyState'),
    
    // Modals
    noteModal: document.getElementById('noteModal'),
    modalTitle: document.getElementById('modalTitle'),
    modalTags: document.getElementById('modalTags'),
    closeModal: document.getElementById('closeModal'),
    closeModalBtn: document.getElementById('closeModalBtn'),
    deleteNoteBtn: document.getElementById('deleteNoteBtn'),

    // Navbar/chat controls
    toggleChatSidebarBtn: document.getElementById('toggleChatSidebarBtn'),
    toggleChat: document.getElementById('toggleChat'),
    
    // Modal tabs
    summaryTab: document.getElementById('summaryTab'),
    originalTab: document.getElementById('originalTab'),
    chatTab: document.getElementById('chatTab'),
    summaryContent: document.getElementById('summaryContent'),
    originalContent: document.getElementById('originalContent'),
    originalText: document.getElementById('originalText'),
    chatContent: document.getElementById('chatContent'),
    noteModalChatMessages: document.getElementById('noteModalChatMessages'),
    chatMessages: document.getElementById('chatMessages'),
    chatInput: document.getElementById('chatInput'),
    sendChatBtn: document.getElementById('sendChatBtn'),
    
    // Modal chat (renamed to avoid conflicts)
    modalChatInput: document.getElementById('modalChatInput'),
    modalSendChatBtn: document.getElementById('modalSendChatBtn'),
    
    // Create Tag Modal
    createTagModal: document.getElementById('createTagModal'),
    newTagName: document.getElementById('newTagName'),
    newTagColor: document.getElementById('newTagColor'),
    newTagColorHex: document.getElementById('newTagColorHex'),
    createTagBtn: document.getElementById('createTagBtn'),
    cancelTagBtn: document.getElementById('cancelTagBtn')
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadTags();
    initializeLucideIcons();
});

// Initialize Lucide Icons
function initializeLucideIcons() {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Event Listeners
function setupEventListeners() {
    // Navigation
    elements.newNoteBtn.addEventListener('click', showNewNoteSection);
    elements.myNotesBtn.addEventListener('click', showMyNotesSection);
    
    // Input tabs
    elements.textTabBtn.addEventListener('click', showTextInput);
    elements.fileTabBtn.addEventListener('click', showFileInput);
    
    // Character counter
    elements.notesInput.addEventListener('input', updateCharCounter);
    
    // File upload
    elements.fileUpload.addEventListener('change', handleFileSelect);
    
    // Main actions
    elements.summarizeBtn.addEventListener('click', summarizeNotes);
    elements.copyBtn.addEventListener('click', copySummary);
    elements.saveBtn.addEventListener('click', saveNote);
    
    // View toggle buttons (new UI)
    const comparisonViewBtn = document.getElementById('comparisonViewBtn');
    const summaryOnlyBtn = document.getElementById('summaryOnlyBtn');
    if (comparisonViewBtn) comparisonViewBtn.addEventListener('click', toggleComparisonView);
    if (summaryOnlyBtn) summaryOnlyBtn.addEventListener('click', toggleSummaryOnlyView);
    
    // Tags
    elements.addTagBtn.addEventListener('click', addTagToNote);
    elements.newTagBtn.addEventListener('click', () => elements.createTagModal.classList.remove('hidden'));
    elements.createTagBtn.addEventListener('click', createNewTag);
    elements.cancelTagBtn.addEventListener('click', () => elements.createTagModal.classList.add('hidden'));
    
    // Tag color sync
    elements.newTagColor.addEventListener('input', (e) => {
        elements.newTagColorHex.value = e.target.value;
    });
    elements.newTagColorHex.addEventListener('input', (e) => {
        elements.newTagColor.value = e.target.value;
    });
    
    // Search and filter
    elements.searchInput.addEventListener('input', debounce(filterNotes, 300));
    elements.tagFilter.addEventListener('change', filterNotes);
    
    // Modal
    elements.closeModal.addEventListener('click', closeNoteModal);
    elements.closeModalBtn.addEventListener('click', closeNoteModal);
    elements.deleteNoteBtn.addEventListener('click', deleteNote);
    
    // Modal tabs
    elements.summaryTab.addEventListener('click', () => showModalTab('summary'));
    elements.originalTab.addEventListener('click', () => showModalTab('original'));
    elements.chatTab.addEventListener('click', () => showModalTab('chat'));
    
    // Chat
    elements.sendChatBtn.disabled = true;
    elements.sendChatBtn.addEventListener('click', sendChatMessage);
    elements.chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendChatMessage();
    });

    // Modal chat (library notes)
    if (elements.modalChatInput && elements.modalSendChatBtn) {
        elements.modalSendChatBtn.disabled = true;
        elements.modalSendChatBtn.addEventListener('click', sendModalChatMessage);
        elements.modalChatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendModalChatMessage();
        });
    }

    // Chat sidebar state: initial closed until toggled
    const chatSidebar = document.getElementById('chatSidebar');
    if (chatSidebar) {
        chatSidebar.classList.remove('sidebar-open');
    }

    // Chat sidebar toggles (disabled until first summarization)
    if (elements.toggleChatSidebarBtn) {
        elements.toggleChatSidebarBtn.disabled = true;
        elements.toggleChatSidebarBtn.addEventListener('click', toggleChatSidebar);
    }
    elements.toggleChat?.addEventListener('click', toggleChatSidebar);

    // Close modal on background click
    elements.noteModal.addEventListener('click', (e) => {
        if (e.target === elements.noteModal) closeNoteModal();
    });
}

// Navigation
function showNewNoteSection() {
    elements.newNoteSection.classList.remove('hidden');
    elements.myNotesSection.classList.add('hidden');
    elements.newNoteBtn.classList.add('bg-primary-500', 'text-white');
    elements.newNoteBtn.classList.remove('text-slate-300');
    elements.myNotesBtn.classList.remove('bg-primary-500', 'text-white');
    elements.myNotesBtn.classList.add('text-slate-300');
}

function showMyNotesSection() {
    elements.myNotesSection.classList.remove('hidden');
    elements.newNoteSection.classList.add('hidden');
    elements.myNotesBtn.classList.add('bg-primary-500', 'text-white');
    elements.myNotesBtn.classList.remove('text-slate-300');
    elements.newNoteBtn.classList.remove('bg-primary-500', 'text-white');
    elements.newNoteBtn.classList.add('text-slate-300');

    loadNotes();
}

// Input tabs
function showTextInput() {
    elements.textInput.classList.remove('hidden');
    elements.fileInput.classList.add('hidden');
    elements.textTabBtn.classList.add('bg-primary-500', 'text-white');
    elements.textTabBtn.classList.remove('text-slate-300', 'hover:bg-slate-600');
    elements.fileTabBtn.classList.remove('bg-primary-500', 'text-white');
    elements.fileTabBtn.classList.add('text-slate-300', 'hover:bg-slate-600');
}

function showFileInput() {
    elements.fileInput.classList.remove('hidden');
    elements.textInput.classList.add('hidden');
    elements.fileTabBtn.classList.add('bg-primary-500', 'text-white');
    elements.fileTabBtn.classList.remove('text-slate-300', 'hover:bg-slate-600');
    elements.textTabBtn.classList.remove('bg-primary-500', 'text-white');
    elements.textTabBtn.classList.add('text-slate-300', 'hover:bg-slate-600');
}

// Character counter
function updateCharCounter() {
    const count = elements.notesInput.value.length;
    elements.charCounter.textContent = count.toLocaleString();
    
    if (count > 50000) {
        elements.charCounter.classList.add('text-red-500');
    } else {
        elements.charCounter.classList.remove('text-red-500');
    }
}

// File handling
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        elements.fileName.textContent = `Selected: ${file.name}`;
    }
}

// Summarize notes
async function summarizeNotes() {
    hideError();
    elements.outputSection.classList.add('hidden');
    elements.loading.classList.remove('hidden');
    elements.summarizeBtn.disabled = true;
    
    try {
        let response;
        
        // Check if using file upload
        if (!elements.fileInput.classList.contains('hidden') && elements.fileUpload.files.length > 0) {
            const formData = new FormData();
            formData.append('file', elements.fileUpload.files[0]);
            
            // ✅ CSRF token added — no Content-Type header (browser sets multipart boundary)
            response = await fetch('/api/summarize', {
                method: 'POST',
                headers: csrfHeaders(),
                body: formData
            });
        } else {
            // Use text input
            const notes = elements.notesInput.value.trim();
            
            if (!notes) {
                showError('Please enter some notes to summarize');
                return;
            }
            
            // ✅ CSRF token added
            response = await fetch('/api/summarize', {
                method: 'POST',
                headers: jsonHeaders(),
                body: JSON.stringify({ notes })
            });
        }
        
        const data = await response.json();
        
        if (!response.ok) {
            // Check for quota exceeded error
            if (data.error && (data.error.includes('quota') || data.error.includes('Quota exceeded') || data.error.includes('429'))) {
                showError('⏰ API Quota Reached\n\nYou have hit the free tier request limit (20 requests/day).\n\nPlease try again tomorrow or upgrade to a paid plan for unlimited requests.');
            } else {
                showError(data.error || 'An error occurred');
            }
            return;
        }
        
        // Display summary in both views (side-by-side and summary-only)
        elements.summaryOutput.innerHTML = formatSummary(data.summary);
        
        // Populate side-by-side comparison view with original and summary
        const originalPreview = document.getElementById('originalContentPreview');
        const summaryPreview = document.getElementById('summaryContentPreview');
        if (originalPreview && summaryPreview) {
            originalPreview.textContent = data.original_content || '';
            summaryPreview.textContent = data.summary || '';
        }
        
        elements.outputSection.classList.remove('hidden');
        currentNoteId = data.note_id;
        
        // Hide tag section until Save is clicked
        elements.tagSection.classList.add('hidden');
        
        // Show side-by-side comparison view by default (if toggles exist)
        const comparisonViewBtn = document.getElementById('comparisonViewBtn');
        const summaryOnlyBtn = document.getElementById('summaryOnlyBtn');
        const comparisonView = document.getElementById('comparisonView');
        const summaryOnlyView = document.getElementById('summaryOnlyView');
        
        if (comparisonViewBtn && summaryOnlyBtn && comparisonView && summaryOnlyView) {
            comparisonView.classList.remove('hidden');
            summaryOnlyView.classList.add('hidden');
            comparisonViewBtn.classList.add('bg-primary-500', 'text-white');
            comparisonViewBtn.classList.remove('text-slate-400');
            summaryOnlyBtn.classList.remove('bg-primary-500', 'text-white');
            summaryOnlyBtn.classList.add('text-slate-400');
        }

        // Enable chat input button after summarizing
        const sendChatBtn = document.getElementById('sendChatBtn');
        if (sendChatBtn) {
            sendChatBtn.disabled = false;
        }

        // Enable AI chat toggle button after summarize (sidebar opens via button)
        if (elements.toggleChatSidebarBtn) {
            elements.toggleChatSidebarBtn.disabled = false;
        }

        // Keep AI chat sidebar hidden until user explicitly toggles
        // (if the user had opened it earlier in this session, keep that state)
        // NOTE: We do not auto-open on summarize to respect user request.

        // Scroll to results
        setTimeout(() => {
            elements.outputSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
        
    } catch (error) {
        showError('Network error. Please check your connection.');
        console.error('Error:', error);
    } finally {
        elements.loading.classList.add('hidden');
        elements.summarizeBtn.disabled = false;
    }
}

// Format summary with better styling
function formatSummary(text) {
    return text
        .split('\n')
        .map(line => {
            line = line.trim();
            if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
                return `<p class="ml-4 mb-2">• ${line.substring(1).trim()}</p>`;
            } else if (line.startsWith('#')) {
                const level = line.match(/^#+/)[0].length;
                const content = line.replace(/^#+\s*/, '');
                return `<h${level} class="font-bold mt-4 mb-2">${content}</h${level}>`;
            } else if (line) {
                return `<p class="mb-2">${line}</p>`;
            }
            return '';
        })
        .join('');
}

// View toggle functions for side-by-side comparison UI
function toggleComparisonView() {
    const comparisonView = document.getElementById('comparisonView');
    const summaryOnlyView = document.getElementById('summaryOnlyView');
    const comparisonViewBtn = document.getElementById('comparisonViewBtn');
    const summaryOnlyBtn = document.getElementById('summaryOnlyBtn');
    
    if (!comparisonView || !summaryOnlyView) return;
    
    comparisonView.classList.remove('hidden');
    summaryOnlyView.classList.add('hidden');
    
    if (comparisonViewBtn) {
        comparisonViewBtn.classList.add('bg-primary-500', 'text-white');
        comparisonViewBtn.classList.remove('text-slate-400');
    }
    if (summaryOnlyBtn) {
        summaryOnlyBtn.classList.remove('bg-primary-500', 'text-white');
        summaryOnlyBtn.classList.add('text-slate-400');
    }
}

function toggleSummaryOnlyView() {
    const comparisonView = document.getElementById('comparisonView');
    const summaryOnlyView = document.getElementById('summaryOnlyView');
    const comparisonViewBtn = document.getElementById('comparisonViewBtn');
    const summaryOnlyBtn = document.getElementById('summaryOnlyBtn');
    
    if (!comparisonView || !summaryOnlyView) return;
    
    comparisonView.classList.add('hidden');
    summaryOnlyView.classList.remove('hidden');
    
    if (summaryOnlyBtn) {
        summaryOnlyBtn.classList.add('bg-primary-500', 'text-white');
        summaryOnlyBtn.classList.remove('text-slate-400');
    }
    if (comparisonViewBtn) {
        comparisonViewBtn.classList.remove('bg-primary-500', 'text-white');
        comparisonViewBtn.classList.add('text-slate-400');
    }
}

function toggleChatSidebar() {
    const chatSidebar = document.getElementById('chatSidebar');
    if (!chatSidebar) return;

    const isOpen = chatSidebar.classList.contains('sidebar-open');
    if (isOpen) {
        chatSidebar.classList.remove('sidebar-open');
    } else {
        chatSidebar.classList.add('sidebar-open');
    }
}
function appendChatHistoryToNotes(role, content) {
    const sidebarMessages = elements.chatMessages;
    const modalMessages = elements.noteModalChatMessages;

    function appendTo(container) {
        if (!container) return;
        const containerItem = document.createElement('div');
        containerItem.className = `flex ${role === 'user' ? 'justify-end' : 'justify-start'}`;
        const bubble = document.createElement('div');
        bubble.className = `rounded-lg px-3 py-2 text-sm max-w-[85%] ${role === 'user' ? 'bg-primary-500 text-white' : 'bg-slate-700 text-slate-100'}`;
        bubble.textContent = `${role === 'user' ? 'You:' : 'AI:'} ${content}`;
        containerItem.appendChild(bubble);
        container.appendChild(containerItem);
        container.scrollTop = container.scrollHeight;
    }

    appendTo(sidebarMessages);
    appendTo(modalMessages);
}

// Copy summary
async function copySummary() {
    try {
        const text = elements.summaryOutput.innerText;
        await navigator.clipboard.writeText(text);
        
        const originalText = elements.copyBtn.innerHTML;
        elements.copyBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Copied!';
        elements.copyBtn.classList.add('bg-green-600');
        
        setTimeout(() => {
            elements.copyBtn.innerHTML = originalText;
            elements.copyBtn.classList.remove('bg-green-600');
        }, 2000);
    } catch (error) {
        showError('Failed to copy to clipboard');
    }
}

// Save note (just reveals the tag section — note is already saved by /api/summarize)
async function saveNote() {
    elements.tagSection.classList.remove('hidden');
    const originalText = elements.saveBtn.innerHTML;
    elements.saveBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Saved!';
    elements.saveBtn.classList.remove('bg-green-600');
    elements.saveBtn.classList.add('bg-green-700');
    elements.saveBtn.disabled = true;
    
    setTimeout(() => {
        elements.saveBtn.innerHTML = originalText;
        elements.saveBtn.classList.add('bg-green-600');
        elements.saveBtn.classList.remove('bg-green-700');
        elements.saveBtn.disabled = false;
    }, 2000);
}

// Tags
async function loadTags() {
    try {
        const response = await fetch('/api/tags');
        const data = await response.json();
        allTags = data.tags;
        
        elements.tagSelect.innerHTML = '<option value="">Select a tag...</option>';
        elements.tagFilter.innerHTML = '<option value="">All Tags</option>';
        
        allTags.forEach(tag => {
            const option = new Option(tag.name, tag.id);
            elements.tagSelect.add(option.cloneNode(true));
            elements.tagFilter.add(option);
        });
    } catch (error) {
        console.error('Error loading tags:', error);
    }
}

async function createNewTag() {
    const name = elements.newTagName.value.trim();
    const color = elements.newTagColorHex.value;
    
    if (!name) {
        alert('Please enter a tag name');
        return;
    }
    
    try {
        // ✅ CSRF token added
        const response = await fetch('/api/tags', {
            method: 'POST',
            headers: jsonHeaders(),
            body: JSON.stringify({ name, color })
        });
        
        if (!response.ok) {
            const data = await response.json();
            alert(data.error || 'Failed to create tag');
            return;
        }
        
        elements.createTagModal.classList.add('hidden');
        elements.newTagName.value = '';
        elements.newTagColorHex.value = '#667eea';
        elements.newTagColor.value = '#667eea';
        
        await loadTags();
    } catch (error) {
        alert('Network error. Please try again.');
        console.error('Error:', error);
    }
}

async function addTagToNote() {
    const tagId = parseInt(elements.tagSelect.value);
    
    if (!tagId || !currentNoteId) return;
    
    try {
        // ✅ CSRF token added
        const response = await fetch(`/api/notes/${currentNoteId}/tags`, {
            method: 'POST',
            headers: jsonHeaders(),
            body: JSON.stringify({ tag_id: tagId })
        });
        
        if (!response.ok) {
            const data = await response.json();
            alert(data.error || 'Failed to add tag');
            return;
        }
        
        // Refresh note tags
        const noteResponse = await fetch(`/api/notes/${currentNoteId}`);
        const noteData = await noteResponse.json();
        displayNoteTags(noteData.tags);
        
    } catch (error) {
        console.error('Error adding tag:', error);
    }
}

function displayNoteTags(tags) {
    elements.selectedTags.innerHTML = '';
    
    tags.forEach(tag => {
        const tagEl = document.createElement('span');
        tagEl.className = 'inline-flex items-center px-3 py-1 rounded-full text-sm';
        tagEl.style.backgroundColor = tag.color + '33';
        tagEl.style.color = tag.color;
        tagEl.innerHTML = `
            ${tag.name}
            <button onclick="removeTag(${tag.id})" class="ml-2 hover:text-red-400">
                <i class="fas fa-times text-xs"></i>
            </button>
        `;
        elements.selectedTags.appendChild(tagEl);
    });
}

async function removeTag(tagId) {
    if (!currentNoteId) return;
    
    try {
        // ✅ CSRF token added + using correct Laravel route: DELETE /api/notes/{note}/tags/{tag}
        await fetch(`/api/notes/${currentNoteId}/tags/${tagId}`, {
            method: 'DELETE',
            headers: csrfHeaders(),
        });
        
        const noteResponse = await fetch(`/api/notes/${currentNoteId}`);
        const noteData = await noteResponse.json();
        displayNoteTags(noteData.tags);
        
    } catch (error) {
        console.error('Error removing tag:', error);
    }
}

// My Notes
async function loadNotes() {
    try {
        const searchTerm = elements.searchInput.value;
        const tagId = elements.tagFilter.value;
        
        let url = '/api/notes?';
        if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`;
        if (tagId) url += `tag_id=${tagId}&`;
        
        const response = await fetch(url);
        const data = await response.json();
        allNotes = data.notes;
        
        displayNotes(allNotes);
    } catch (error) {
        console.error('Error loading notes:', error);
    }
}

function displayNotes(notes) {
    elements.notesGrid.innerHTML = '';
    
    if (notes.length === 0) {
        elements.emptyState.classList.remove('hidden');
        return;
    }
    
    elements.emptyState.classList.add('hidden');
    
    notes.forEach(note => {
        const noteCard = createNoteCard(note);
        elements.notesGrid.appendChild(noteCard);
    });
    
    initializeLucideIcons();
}

function createNoteCard(note) {
    const card = document.createElement('div');
    
    const preview = note.summary.replace(/<[^>]*>?/gm, '').substring(0, 100) + '...';
    const date = new Date(note.created_at).toLocaleDateString();
    
    card.className = "group glass rounded-2xl p-6 hover:bg-white/5 transition-all cursor-pointer border border-white/5 hover:border-primary-500/30 hover:-translate-y-1 relative overflow-hidden";
    
    card.innerHTML = `
        <div class="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div class="relative z-10">
            <div class="flex justify-between items-start mb-4">
                <div class="p-2 bg-dark-800 rounded-lg text-primary-400">
                    <i data-lucide="file-text" class="w-5 h-5"></i>
                </div>
                <span class="text-xs text-slate-500 font-mono">${date}</span>
            </div>
            <h3 class="text-lg font-bold text-white mb-2 line-clamp-1">${note.title}</h3>
            <p class="text-slate-400 text-sm mb-4 h-10 overflow-hidden">${preview}</p>
            <div class="flex gap-2 flex-wrap">
                ${note.tags.map(tag => `
                    <span class="px-2 py-1 bg-dark-800 rounded-md text-xs text-slate-300 border border-white/5" style="background-color: ${tag.color}22; color: ${tag.color}">
                        ${tag.name}
                    </span>
                `).join('')}
            </div>
        </div>
    `;
    
    card.onclick = () => openNoteModal(note.id);
    
    return card;
}

function filterNotes() {
    loadNotes();
}

// Note Modal
async function openNoteModal(noteId) {
    try {
        const response = await fetch(`/api/notes/${noteId}`);
        const note = await response.json();
        
        currentNoteId = noteId;
        elements.modalTitle.textContent = note.title;
        elements.summaryContent.innerHTML = formatSummary(note.summary);
        elements.originalText.textContent = note.original_content;
        
        elements.modalTags.innerHTML = note.tags.map(tag => `
            <span class="px-3 py-1 rounded-full text-sm" style="background-color: ${tag.color}33; color: ${tag.color}">
                ${tag.name}
            </span>
        `).join('');
        
        await loadChatHistory(noteId);
        
        // Enable modal chat button once note is loaded
        if (elements.modalSendChatBtn) {
            elements.modalSendChatBtn.disabled = false;
        }
        
        showModalTab('summary');
        elements.noteModal.classList.remove('hidden');
        
    } catch (error) {
        console.error('Error opening note:', error);
        alert('Failed to load note');
    }
}

function closeNoteModal() {
    elements.noteModal.classList.add('hidden');
    currentNoteId = null;
    
    // Disable modal chat button when modal closes
    if (elements.modalSendChatBtn) {
        elements.modalSendChatBtn.disabled = true;
    }
}

function showModalTab(tab) {
    [elements.summaryTab, elements.originalTab, elements.chatTab].forEach(btn => {
        btn.classList.remove('bg-primary-500', 'text-white');
        btn.classList.add('text-slate-300', 'hover:bg-slate-600');
    });
    
    [elements.summaryContent, elements.originalContent, elements.chatContent].forEach(content => {
        content.classList.add('hidden');
    });
    
    if (tab === 'summary') {
        elements.summaryTab.classList.add('bg-primary-500', 'text-white');
        elements.summaryTab.classList.remove('text-slate-300', 'hover:bg-slate-600');
        elements.summaryContent.classList.remove('hidden');
    } else if (tab === 'original') {
        elements.originalTab.classList.add('bg-primary-500', 'text-white');
        elements.originalTab.classList.remove('text-slate-300', 'hover:bg-slate-600');
        elements.originalContent.classList.remove('hidden');
    } else if (tab === 'chat') {
        elements.chatTab.classList.add('bg-primary-500', 'text-white');
        elements.chatTab.classList.remove('text-slate-300', 'hover:bg-slate-600');
        elements.chatContent.classList.remove('hidden');
    }
}

// Chat
async function loadChatHistory(noteId) {
    try {
        const response = await fetch(`/api/notes/${noteId}/chat`);
        const data = await response.json();

        if (elements.chatMessages) elements.chatMessages.innerHTML = '';
        if (elements.noteModalChatMessages) elements.noteModalChatMessages.innerHTML = '';

        if (data.messages.length === 0) {
            const emptyNote = '<p class="text-slate-400 text-center py-8">No chat history yet. Ask a question to start!</p>';
            if (elements.chatMessages) elements.chatMessages.innerHTML = emptyNote;
            if (elements.noteModalChatMessages) elements.noteModalChatMessages.innerHTML = emptyNote;
            return;
        }

        data.messages.forEach(msg => {
            addChatMessage(msg.role, msg.content);
        });

    } catch (error) {
        console.error('Error loading chat:', error);
    }
}

async function sendChatMessage() {
    const question = elements.chatInput.value.trim();
    
    if (!question) return;
    
    if (!currentNoteId) {
        alert('Note not loaded. Please summarize notes first.');
        return;
    }
    
    elements.chatInput.value = '';
    elements.sendChatBtn.disabled = true;
    
    addChatMessage('user', question);
    
    const loadingMsg = document.createElement('div');
    loadingMsg.className = 'flex justify-start';
    loadingMsg.innerHTML = `
        <div class="bg-slate-700 rounded-lg px-4 py-3 max-w-[80%]">
            <div class="spinner" style="width: 20px; height: 20px; border-width: 2px;"></div>
        </div>
    `;
    elements.chatMessages.appendChild(loadingMsg);
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
    
    try {
        console.log('Sending chat message to:', `/api/notes/${currentNoteId}/chat`);
        console.log('Question:', question);
        
        const response = await fetch(`/api/notes/${currentNoteId}/chat`, {
            method: 'POST',
            headers: jsonHeaders(),
            body: JSON.stringify({ question })
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const data = await response.json();
            console.error('Server error:', data);
            loadingMsg.remove();
            
            // Check for quota exceeded error
            if (data.error && (data.error.includes('quota') || data.error.includes('Quota exceeded') || data.error.includes('429'))) {
                alert('⏰ API Quota Reached\n\nYou have hit the free tier request limit (20 requests/day).\n\nPlease try again tomorrow or upgrade to a paid plan for unlimited requests.');
            } else {
                alert(`Error: ${data.error || 'Unknown error'}`);
            }
            return;
        }
        
        const data = await response.json();
        console.log('AI response:', data);
        loadingMsg.remove();
        
        addChatMessage('assistant', data.response);
        
    } catch (error) {
        console.error('Chat error:', error);
        console.error('Error stack:', error.stack);
        loadingMsg.remove();
        alert(`Network error: ${error.message}`);
    } finally {
        elements.sendChatBtn.disabled = false;
        elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
    }
}

function addChatMessage(role, content) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `flex ${role === 'user' ? 'justify-end' : 'justify-start'}`;
    
    const bgColor = role === 'user' ? 'bg-primary-500' : 'bg-slate-700';
    
    msgDiv.innerHTML = `
        <div class="${bgColor} rounded-lg px-4 py-3 max-w-[80%]">
            <p class="text-sm whitespace-pre-wrap">${content}</p>
        </div>
    `;
    
    elements.chatMessages.appendChild(msgDiv);
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

// Modal Chat Message Handler (for library note chat)
async function sendModalChatMessage() {
    const question = elements.modalChatInput.value.trim();
    
    if (!question) return;
    
    if (!currentNoteId) {
        alert('Note not loaded. Please select a note first.');
        return;
    }
    
    elements.modalChatInput.value = '';
    elements.modalSendChatBtn.disabled = true;
    
    addModalChatMessage('user', question);
    
    const loadingMsg = document.createElement('div');
    loadingMsg.className = 'flex justify-start';
    loadingMsg.innerHTML = `
        <div class="bg-slate-700 rounded-lg px-4 py-3 max-w-[80%]">
            <div class="spinner" style="width: 20px; height: 20px; border-width: 2px;"></div>
        </div>
    `;
    elements.noteModalChatMessages.appendChild(loadingMsg);
    elements.noteModalChatMessages.scrollTop = elements.noteModalChatMessages.scrollHeight;
    
    try {
        console.log('Sending modal chat message to:', `/api/notes/${currentNoteId}/chat`);
        console.log('Question:', question);
        
        const response = await fetch(`/api/notes/${currentNoteId}/chat`, {
            method: 'POST',
            headers: jsonHeaders(),
            body: JSON.stringify({ question })
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const data = await response.json();
            console.error('Server error:', data);
            loadingMsg.remove();
            
            // Check for quota exceeded error
            if (data.error && (data.error.includes('quota') || data.error.includes('Quota exceeded') || data.error.includes('429'))) {
                alert('⏰ API Quota Reached\n\nYou have hit the free tier request limit (20 requests/day).\n\nPlease try again tomorrow or upgrade to a paid plan for unlimited requests.');
            } else {
                alert(`Error: ${data.error || 'Unknown error'}`);
            }
            return;
        }
        
        const data = await response.json();
        console.log('AI response:', data);
        loadingMsg.remove();
        
        addModalChatMessage('assistant', data.response);
        
    } catch (error) {
        console.error('Modal chat error:', error);
        console.error('Error stack:', error.stack);
        loadingMsg.remove();
        alert(`Network error: ${error.message}`);
    } finally {
        elements.modalSendChatBtn.disabled = false;
        elements.noteModalChatMessages.scrollTop = elements.noteModalChatMessages.scrollHeight;
    }
}

function addModalChatMessage(role, content) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `flex ${role === 'user' ? 'justify-end' : 'justify-start'}`;
    
    const bgColor = role === 'user' ? 'bg-primary-500' : 'bg-slate-700';
    
    msgDiv.innerHTML = `
        <div class="${bgColor} rounded-lg px-4 py-3 max-w-[80%]">
            <p class="text-sm whitespace-pre-wrap">${content}</p>
        </div>
    `;
    
    elements.noteModalChatMessages.appendChild(msgDiv);
    elements.noteModalChatMessages.scrollTop = elements.noteModalChatMessages.scrollHeight;
}

// Delete note
async function deleteNote() {
    if (!currentNoteId) return;
    
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    try {
        // ✅ CSRF token added
        const response = await fetch(`/api/notes/${currentNoteId}`, {
            method: 'DELETE',
            headers: csrfHeaders(),
        });
        
        if (!response.ok) {
            alert('Failed to delete note');
            return;
        }
        
        closeNoteModal();
        loadNotes();
        
    } catch (error) {
        console.error('Error deleting note:', error);
        alert('Network error. Please try again.');
    }
}

// Error handling
function showError(message) {
    elements.errorMessage.textContent = message;
    elements.errorSection.classList.remove('hidden');
    elements.loading.classList.add('hidden');
}

function hideError() {
    elements.errorSection.classList.add('hidden');
}

// Utility
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
// Enhanced Index Page - Side-by-Side Comparison & Chat Sidebar
document.addEventListener('DOMContentLoaded', function() {
    // State management
    let currentNoteId = null;
    let originalText = '';
    let summaryText = '';

    // DOM Elements
    const summarizeBtn = document.getElementById('summarizeBtn');
    const outputSection = document.getElementById('outputSection');
    const loading = document.getElementById('loading');
    const notesInput = document.getElementById('notesInput');
    const fileUpload = document.getElementById('fileUpload');
    const saveBtn = document.getElementById('saveBtn');
    const tagSection = document.getElementById('tagSection');
    
    // View toggle elements
    const comparisonViewBtn = document.getElementById('comparisonViewBtn');
    const summaryOnlyBtn = document.getElementById('summaryOnlyBtn');
    const comparisonView = document.getElementById('comparisonView');
    const summaryOnlyView = document.getElementById('summaryOnlyView');
    
    // Chat elements
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const sendChatBtn = document.getElementById('sendChatBtn');
    const chatSidebar = document.getElementById('chatSidebar');

    // ===== SUMMARIZATION LOGIC =====
    // NOTE: Summarization is now handled by script.js to avoid duplicate listeners
    // This file handles the UI enhancements (view toggle, chat, save)

    // ===== DISPLAY RESULTS =====
    function displayResults(original, summary) {
        document.getElementById('originalContentPreview').textContent = original;
        document.getElementById('summaryContentPreview').textContent = summary;
        document.getElementById('summaryOutput').innerHTML = `<p>${summary.replace(/\n/g, '</p><p>')}</p>`;
        
        // Reset view to side-by-side
        switchToComparisonView();
    }

    // ===== VIEW TOGGLE =====
    comparisonViewBtn.addEventListener('click', switchToComparisonView);
    summaryOnlyBtn.addEventListener('click', switchToSummaryOnlyView);

    function switchToComparisonView() {
        comparisonView.classList.remove('hidden');
        summaryOnlyView.classList.add('hidden');
        
        comparisonViewBtn.classList.add('bg-dark-700', 'text-white', 'shadow-sm');
        comparisonViewBtn.classList.remove('text-slate-400', 'hover:text-white', 'hover:bg-white/5');
        
        summaryOnlyBtn.classList.remove('bg-dark-700', 'text-white', 'shadow-sm');
        summaryOnlyBtn.classList.add('text-slate-400', 'hover:text-white', 'hover:bg-white/5');
    }

    function switchToSummaryOnlyView() {
        comparisonView.classList.add('hidden');
        summaryOnlyView.classList.remove('hidden');
        
        summaryOnlyBtn.classList.add('bg-dark-700', 'text-white', 'shadow-sm');
        summaryOnlyBtn.classList.remove('text-slate-400', 'hover:text-white', 'hover:bg-white/5');
        
        comparisonViewBtn.classList.remove('bg-dark-700', 'text-white', 'shadow-sm');
        comparisonViewBtn.classList.add('text-slate-400', 'hover:text-white', 'hover:bg-white/5');
    }

    // ===== SAVE NOTE =====
    saveBtn.addEventListener('click', async function() {
        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

        try {
            const response = await fetch('/api/notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify({
                    title: generateTitle(originalText),
                    original_content: originalText,
                    summary: summaryText
                })
            });

            if (!response.ok) throw new Error('Failed to save note');

            const data = await response.json();
            currentNoteId = data.id;

            // Enable chat
            enableChat();
            tagSection.classList.remove('hidden');
            saveBtn.disabled = true;
            saveBtn.classList.add('opacity-50', 'cursor-not-allowed');
            
            // Load tags
            loadTags();

            alert('Note saved successfully!');
        } catch (error) {
            console.error('Error:', error);
            alert('Error saving note. Please try again.');
        }
    });

    // ===== CHAT FUNCTIONALITY =====
    function enableChat() {
        chatInput.disabled = false;
        sendChatBtn.disabled = false;
        document.querySelector('#chatInput + p').textContent = '(Ask your questions)';
    }

    function clearChat() {
        chatMessages.innerHTML = '<div class="text-center text-slate-500 text-sm py-4"><p>Ask questions about your notes</p></div>';
    }

    sendChatBtn.addEventListener('click', sendChatMessage);
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendChatMessage();
        }
    });

    async function sendChatMessage() {
        if (!currentNoteId) {
            alert('Please save the note first');
            return;
        }

        const message = chatInput.value.trim();
        if (!message) return;

        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

        // Add user message to chat
        addChatMessage(message, 'user');
        chatInput.value = '';
        sendChatBtn.disabled = true;

        try {
            const response = await fetch(`/api/notes/${currentNoteId}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify({ content: message })
            });

            if (!response.ok) throw new Error('Chat failed');

            const data = await response.json();
            addChatMessage(data.ai_response, 'assistant');
        } catch (error) {
            console.error('Error:', error);
            addChatMessage('Sorry, I encountered an error processing your question.', 'assistant');
        } finally {
            sendChatBtn.disabled = false;
        }
    }

    function addChatMessage(content, role) {
        // Remove empty state if present
        if (chatMessages.querySelector('.text-center')) {
            chatMessages.innerHTML = '';
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `flex gap-2 animate-slideIn ${role === 'user' ? 'justify-end' : 'justify-start'}`;
        messageDiv.innerHTML = `
            <div class="${role === 'user' ? 'bg-primary-600 text-white rounded-2xl rounded-tr-md' : 'bg-dark-700 text-slate-200 rounded-2xl rounded-tl-md'} px-4 py-2 max-w-xs text-sm leading-relaxed">
                ${content.replace(/\n/g, '<br>')}
            </div>
        `;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // ===== TAG MANAGEMENT =====
    async function loadTags() {
        try {
            const response = await fetch('/api/tags');
            const tags = await response.json();
            
            const tagSelect = document.getElementById('tagSelect');
            tagSelect.innerHTML = '<option value="">Select a tag...</option>';
            
            tags.forEach(tag => {
                const option = document.createElement('option');
                option.value = tag.id;
                option.textContent = tag.name;
                tagSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading tags:', error);
        }
    }

    document.getElementById('addTagBtn').addEventListener('click', async function() {
        const tagSelect = document.getElementById('tagSelect');
        const tagId = tagSelect.value;

        if (!tagId || !currentNoteId) return;

        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

        try {
            const response = await fetch(`/api/notes/${currentNoteId}/tags`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify({ tag_id: tagId })
            });

            if (response.ok) {
                displayAttachedTag(tagSelect.options[tagSelect.selectedIndex].text);
                tagSelect.value = '';
            }
        } catch (error) {
            console.error('Error adding tag:', error);
        }
    });

    function displayAttachedTag(tagName) {
        const selectedTags = document.getElementById('selectedTags');
        const tag = document.createElement('span');
        tag.className = 'px-3 py-1 bg-primary-500/20 text-primary-400 rounded-lg text-sm border border-primary-500/30';
        tag.textContent = tagName;
        selectedTags.appendChild(tag);
    }

    // ===== UTILITY FUNCTIONS =====
    async function readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            
            if (file.type === 'application/pdf') {
                // For PDFs, we'll need a library, so just mark it for processing
                reader.readAsArrayBuffer(file);
            } else {
                reader.readAsText(file);
            }
        });
    }

    function generateTitle(text) {
        return text.substring(0, 50).split('\n')[0] + '...';
    }

    // Copy to clipboard functionality
    document.getElementById('copyBtn2')?.addEventListener('click', function() {
        navigator.clipboard.writeText(summaryText).then(() => {
            alert('Summary copied to clipboard!');
        });
    });

    // Character counter
    document.getElementById('charCounter').parentElement.style.display = 'block';
    notesInput.addEventListener('input', function() {
        document.getElementById('charCounter').textContent = this.value.length;
    });
});

# NoteMaster AI 🧠

A production-ready, SaaS-style AI study assistant built with Laravel 11. Paste text or upload a PDF and get an instant AI-generated summary, then chat with the AI about your notes — all saved to your personal account.

---

## Features

- **AI Summarization** — paste text or upload PDF/TXT files, get structured bullet-point summaries via Google Gemini
- **Context-Aware Chat** — ask questions about any saved note; the AI answers based strictly on that note's content
- **Guest Mode** — visitors can summarize and chat without an account; data is not saved
- **User Accounts** — register/login to permanently save notes, tags, and chat history
- **Tag System** — create custom colored tags and assign them to notes
- **Instant Search** — search notes by keyword or filter by tag
- **ChatGPT-Style Sidebar** — history panel updates in real time after every action

---

## Requirements

Make sure you have all of these installed before starting:

| Tool | Minimum Version | Check with |
|------|----------------|------------|
| PHP | 8.2+ | `php -v` |
| Composer | 2.x | `composer -V` |
| Node.js | 18+ | `node -v` |
| npm | 9+ | `npm -v` |
| MySQL | 8.0+ (or use SQLite) | `mysql --version` |

You also need a **Google Gemini API key** — get one free at [aistudio.google.com](https://aistudio.google.com).

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/notemaster-ai.git
cd notemaster-ai
```

### 2. Install PHP dependencies

```bash
composer install
```

### 3. Install Node dependencies

```bash
npm install
```

### 4. Create your environment file

```bash
cp .env.example .env
```

### 5. Generate the application key

```bash
php artisan key:generate
```

### 6. Configure your `.env` file

Open `.env` and fill in these values:

```env
APP_NAME="NoteMaster AI"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000

# ── Database ───────────────────────────────────────────
# Option A: MySQL (recommended)
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=notemaster_ai
DB_USERNAME=root
DB_PASSWORD=your_mysql_password

# Option B: SQLite (easier for local dev — see step below)
# DB_CONNECTION=sqlite

# ── Google Gemini API ──────────────────────────────────
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

# ── File Upload Limits ─────────────────────────────────
MAX_FILE_SIZE=16384
ALLOWED_EXTENSIONS=pdf,txt
NOTES_MAX_LENGTH=50000
NOTES_MIN_LENGTH=10
```

---

## Database Setup

### Option A — MySQL

Create the database first:

```sql
CREATE DATABASE notemaster_ai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Then run migrations:

```bash
php artisan migrate
```

### Option B — SQLite (no MySQL needed)

```bash
# 1. Switch the driver in .env
# DB_CONNECTION=sqlite

# 2. Create the database file
touch database/database.sqlite
# Windows PowerShell:
# New-Item -Path database -Name database.sqlite -ItemType File

# 3. Run migrations
php artisan migrate
```

---

## Running the App

You need **two terminal windows** running at the same time.

**Terminal 1 — Laravel server:**

```bash
php artisan serve
```

**Terminal 2 — Vite asset builder (if using compiled assets):**

```bash
npm run dev
```

> If you are using the CDN Tailwind version (no Vite), you only need Terminal 1.

Open your browser at: **http://127.0.0.1:8000**

---

## Installing the PDF Parser

The app uses `smalot/pdfparser` to extract text from uploaded PDFs. It should already be in `composer.json`, but if you get errors on PDF upload, run:

```bash
composer require smalot/pdfparser
```

---

## Project Structure

```
notemaster-ai/
├── app/
│   ├── Http/Controllers/
│   │   ├── AuthController.php      # Login, register, logout
│   │   ├── NoteController.php      # Summarize, list, show, delete notes
│   │   ├── ChatController.php      # Auth chat + guest chat endpoints
│   │   └── TagController.php       # Tag CRUD + attach/detach
│   ├── Models/
│   │   ├── Note.php                # belongsToMany(Tag), hasMany(Message)
│   │   ├── Tag.php                 # belongsToMany(Note)
│   │   ├── Message.php             # belongsTo(Note)
│   │   └── User.php                # hasMany(Note)
│   └── Services/
│       ├── AiService.php           # Gemini API calls (summary + chat)
│       └── FileParserService.php   # PDF/TXT text extraction
├── config/
│   └── notemaster.php              # App-specific config (API keys, limits)
├── database/migrations/            # All table definitions
├── public/js/
│   └── script.js                   # Frontend JavaScript
├── resources/views/
│   ├── index.blade.php             # Main app UI
│   └── auth/
│       ├── login.blade.php
│       └── register.blade.php
└── routes/
    └── web.php                     # All routes
```

---

## API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/summarize` | Generate summary + save note | No (guests supported) |
| GET | `/api/notes` | List all notes for current user | Yes |
| GET | `/api/notes/{id}` | Get a single note | Yes |
| DELETE | `/api/notes/{id}` | Delete a note | Yes |
| POST | `/api/notes/{id}/chat` | Send a chat message | Yes |
| GET | `/api/notes/{id}/chat` | Get chat history | Yes |
| POST | `/api/guest-chat` | Stateless chat for guests | No |
| GET | `/api/tags` | List all tags | No |
| POST | `/api/tags` | Create a new tag | Yes |
| POST | `/api/notes/{id}/tags` | Attach a tag to a note | Yes |
| DELETE | `/api/notes/{id}/tags/{tag}` | Remove a tag from a note | Yes |

---

## Common Issues

**`Access denied for user 'root'@'localhost'`**
Your MySQL password in `.env` is wrong. Try `DB_PASSWORD=` (empty) or switch to SQLite.

**`RuntimeException: No application encryption key`**
Run `php artisan key:generate`.

**`Network error. Please check your connection.`**
Make sure `php artisan serve` is running and you're accessing `http://127.0.0.1:8000` (not `localhost`).

**Summaries cut off mid-sentence**
Check that `maxOutputTokens` in `AiService.php` is set to `8192`, not `2000`.

**PDF upload returns an error**
Run `composer require smalot/pdfparser` and make sure `php.ini` has `extension=fileinfo` enabled.

**CSRF token mismatch (419 error)**
Make sure `<meta name="csrf-token" content="{{ csrf_token() }}">` is in the `<head>` of `index.blade.php` and that `public/js/script.js` is the updated version with `jsonHeaders()` and `csrfHeaders()` helpers.

---

## Environment Variables Reference

| Variable | Description | Default |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Your Google Gemini API key | — |
| `GEMINI_MODEL` | Gemini model to use | `gemini-2.5-flash` |
| `MAX_FILE_SIZE` | Max upload size in KB | `16384` (16MB) |
| `ALLOWED_EXTENSIONS` | Comma-separated allowed file types | `pdf,txt` |
| `NOTES_MAX_LENGTH` | Max characters for text input | `50000` |
| `NOTES_MIN_LENGTH` | Min characters for text input | `10` |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend Framework | Laravel 11 (PHP 8.2+) |
| ORM | Eloquent |
| Database | MySQL 8 / SQLite |
| AI Provider | Google Gemini 2.5 Flash |
| Frontend Styling | Tailwind CSS (CDN) |
| Frontend Logic | Vanilla JavaScript |
| Icons | Lucide Icons |
| PDF Parsing | smalot/pdfparser |
| Fonts | Inter + Space Grotesk (Google Fonts) |

---

## Security Notes

- Never commit your `.env` file — it is already in `.gitignore`
- Never hardcode your `GEMINI_API_KEY` anywhere in the source code
- All state-changing API requests are protected by Laravel's CSRF middleware
- Users can only access, modify, or delete their own notes (ownership checked in every controller method)

---

*Built with Laravel 11 · Powered by Google Gemini · Made by PJ*
# Notemaster - Laravel Version

A modern note-taking application built with Laravel, featuring AI-powered summarization, PDF parsing, real-time chat, and tag management.

## Features

- 📝 **Note Management**: Create, edit, and organize notes
- 🤖 **AI Integration**: Automatic note summarization using AI services
- 📄 **PDF Processing**: Upload and parse PDF documents
- 💬 **Real-time Chat**: Communicate with other users
- 🏷️ **Tag System**: Organize notes with customizable tags
- 🎨 **Modern UI**: Built with Tailwind CSS and Alpine.js
- 🔐 **Authentication**: Secure user authentication with Laravel Breeze

## Prerequisites

Before you begin, ensure you have the following installed:
- **PHP 8.2 or higher** (with extensions: pdo, sqlite, mbstring, xml, curl)
- **Composer** (PHP dependency manager)
- **Node.js 18+ and npm** (for frontend assets)
- **Git** (optional, for version control)

## Installation Guide

### Step 1: Extract and Navigate
```bash
# Extract the zip file to your desired directory
unzip notemaster-laravel-version.zip
cd notemaster-laravel-version
```

### Step 2: Install PHP Dependencies
```bash
composer install
```

### Step 3: Environment Setup
```bash
# Copy environment configuration -- Only Run if .env file
cp .env.example .env

# Generate application encryption key
php artisan key:generate
```

### Step 4: Database Setup
```bash
# Run database migrations (uses SQLite by default)
php artisan migrate --force

# Optional: Seed with test data
php artisan db:seed --force
```

### Step 5: Frontend Assets
```bash
# Install Node.js dependencies
npm install

# Build assets for production
npm run build
```

### Step 6: Start the Application
```bash
# Start all development services (recommended)
composer run dev

# Or start services individually:
php artisan serve          # Laravel server (http://127.0.0.1:8000)
php artisan queue:listen    # Background job processing
npm run dev                 # Vite dev server (hot reload)
```

## Usage

1. **Access the Application**: Open http://127.0.0.1:8000 in your browser
2. **Register/Login**: Create an account or use the test credentials:
   - Email: `test@example.com`
   - Password: `password`
3. **Start Using**: Create notes, upload PDFs, use the chat system, and explore AI features

## Project Structure

```
├── app/                    # Laravel application code
│   ├── Http/Controllers/   # Controllers
│   ├── Models/            # Eloquent models
│   └── Services/          # Business logic services
├── database/              # Migrations and seeders
├── public/                # Public assets
├── resources/             # Views and frontend assets
│   ├── css/              # Stylesheets
│   ├── js/               # JavaScript files
│   └── views/            # Blade templates
├── routes/                # Route definitions
└── config/                # Configuration files
```

## Key Technologies

- **Backend**: Laravel 12.x, PHP 8.2+
- **Database**: SQLite (default), MySQL/PostgreSQL supported
- **Frontend**: Blade templates, Alpine.js, Tailwind CSS
- **Build Tool**: Vite
- **Authentication**: Laravel Breeze
- **AI Integration**: Configurable AI service
- **File Processing**: PDF parsing with smalot/pdfparser

## Configuration

### Database
The application uses SQLite by default. To use MySQL/PostgreSQL:
1. Update `DB_CONNECTION` in `.env`
2. Configure database credentials
3. Run migrations

### AI Service
Configure AI integration in `config/ai.php` and update `.env` with API keys.

### Queue System
For production, configure a queue driver (Redis, database, etc.) in `.env`.

## Development

### Running Tests
```bash
php artisan test
```

### Code Style
```bash
# Check code style
./vendor/bin/pint --test

# Fix code style
./vendor/bin/pint
```

### Building Assets
```bash
# Development build with hot reload
npm run dev

# Production build
npm run build
```

## Troubleshooting

### Common Issues

**Composer install fails**
```bash
composer clear-cache
composer install
```

**Permission errors**
```bash
# Fix storage permissions
chmod -R 755 storage/
chmod -R 755 bootstrap/cache/
```

**Database connection issues**
- Ensure SQLite file exists: `touch database/database.sqlite`
- Check `.env` database configuration

**Asset compilation fails**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and ensure code style
5. Submit a pull request

## License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

## Support

For support, please check the Laravel documentation or create an issue in the repository.
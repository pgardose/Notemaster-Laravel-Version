<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login — NoteMaster AI</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; background: #0f111a; }
        .brand { font-family: 'Space Grotesk', sans-serif; }
    </style>
</head>
<body class="min-h-screen flex items-center justify-center p-4">

    <div class="w-full max-w-md">
        <!-- Logo -->
        <div class="text-center mb-8">
            <a href="/" class="brand text-2xl font-bold text-white">
                NoteMaster <span class="text-indigo-400">AI</span>
            </a>
            <p class="text-slate-400 mt-2">Welcome back</p>
        </div>

        <!-- Card -->
        <div class="bg-white/5 border border-white/10 rounded-2xl p-8">
            @if ($errors->any())
                <div class="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    {{ $errors->first() }}
                </div>
            @endif

            <form method="POST" action="/login">
                @csrf

                <div class="mb-4">
                    <label class="block text-sm text-slate-300 mb-2">Email</label>
                    <input type="email" name="email" value="{{ old('email') }}" required
                        class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                        placeholder="you@example.com">
                </div>

                <div class="mb-6">
                    <label class="block text-sm text-slate-300 mb-2">Password</label>
                    <input type="password" name="password" required
                        class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                        placeholder="••••••••">
                </div>

                <div class="flex items-center mb-6">
                    <input type="checkbox" name="remember" id="remember" class="mr-2 accent-indigo-500">
                    <label for="remember" class="text-sm text-slate-400">Remember me</label>
                </div>

                <button type="submit"
                    class="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition">
                    Sign In
                </button>
            </form>

            <p class="text-center text-slate-400 text-sm mt-6">
                Don't have an account?
                <a href="/register" class="text-indigo-400 hover:text-indigo-300 font-medium">Sign up</a>
            </p>
        </div>

        <p class="text-center mt-4">
            <a href="/" class="text-slate-500 hover:text-slate-400 text-sm">← Continue as guest</a>
        </p>
    </div>

</body>
</html>
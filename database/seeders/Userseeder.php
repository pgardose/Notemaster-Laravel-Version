<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserSeeder extends Seeder
{
   
    public function run(): void
    {
        // ── Admin / Test Account ─────────────────────────────────────────
        // Use firstOrCreate so re-running the seeder never throws a
        // "Duplicate entry" error on the unique email column.
        User::firstOrCreate(
            ['email' => 'admin@notemaster.com'],
            [
                'name'              => 'PJ Admin',
                'password'          => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        // ── 5 Dummy Users ────────────────────────────────────────────────
        // The built-in UserFactory (from Laravel's default scaffold) already
        // generates realistic names, emails, and hashed passwords via Faker.
        User::factory(5)->create();
    }
}
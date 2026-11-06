<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Creates the first admin account.
 * Change the credentials before running in production!
 *
 * Run with:  php artisan db:seed --class=AdminUserSeeder
 */
class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@ecosort.local'],
            [
                'name'     => 'Admin',
                'password' => Hash::make('admin1234'),
                'is_admin' => true,
            ]
        );

        $this->command->info('Admin account ready — email: admin@ecosort.local  password: admin1234');
        $this->command->warn('Change the password immediately after first login!');
    }
}

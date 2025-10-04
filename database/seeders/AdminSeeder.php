<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Create admin user if it doesn't exist
        if (!User::where('username', 'admin')->exists()) {
            User::create([
                'username' => 'admin',
                'password' => Hash::make('admin12345'),
                'role' => 'admin',
            ]);
            
            $this->command->info('Admin user created successfully!');
            $this->command->info('Username: admin');
            $this->command->info('Password: admin12345');
        } else {
            $this->command->info('Admin user already exists.');
        }
    }
}
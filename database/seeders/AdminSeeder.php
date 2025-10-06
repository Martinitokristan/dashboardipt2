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
                'first_name' => 'AKade',
                'last_name' => 'Mi',
                'email' => 'AKademi@edutech.com',
                'password' => Hash::make('admin12345'),
                'role' => 'admin',
                'avatar' => null,
            ]);
            
            $this->command->info('Admin user created successfully!');
            $this->command->info('Username: admin');
            $this->command->info('Password: admin12345');
            $this->command->info('Name: AKade Mi');
            $this->command->info('Email: AKademi@edutech.com');
            $this->command->info('Role: System Administrator');
        } else {
            $this->command->info('Admin user already exists.');
        }
    }
}
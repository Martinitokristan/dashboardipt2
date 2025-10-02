<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        if (!User::where('username', 'admin')->exists()) {
            $data = [
                'username' => 'admin',
                'password' => Hash::make('admin12345'),
                'role' => 'admin',
            ];

            if (Schema::hasColumn('users', 'name')) {
                $data['name'] = 'Administrator';
            }
            if (Schema::hasColumn('users', 'email')) {
                $data['email'] = 'admin@example.com';
            }

            User::create($data);
        }
    }
}

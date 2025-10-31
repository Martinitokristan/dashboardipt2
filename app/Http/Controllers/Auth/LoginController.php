<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LoginController extends Controller
{
    public function showLoginForm()
    {
        return view('dashboard');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        if (Auth::attempt($credentials, $request->filled('remember'))) {
            $request->session()->regenerate();
            $user = Auth::user();

            if (!$user->isAdmin()) {
                Auth::logout();
                return response()->json([
                    'errors' => ['general' => ['Unauthorized. Admins only.']],
                ], 403);
            }

            $user->forceFill([
                'last_login_at' => now(),
                'last_login_agent' => substr($request->userAgent() ?? '', 0, 255),
            ])->save();

            $token = $user->createToken('auth_token')->plainTextToken;
            return response()->json(['redirect' => '/dashboard', 'token' => $token]);
        }

        return response()->json([
            'errors' => ['username' => ['The provided credentials do not match our records.']],
        ], 422);
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect('/');
    }
}

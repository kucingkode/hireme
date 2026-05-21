<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

use App\Models\User;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'username' => [
                'required',
                'string',
                'min:3',
                'max:30',
                'regex:/^[a-zA-Z0-9_]+$/'
            ],
            'password' => [
                'required',
                'string',
                'min:8'
            ]
        ]);

        if (Auth::attempt($credentials, true)) {
            $request->session()->regenerate();
            return response()->json([], 200);
        }

        return response()->json([
            'message' => 'Wrong username or password',
        ], 401);
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'username' => [
                'required',
                'string',
                'min:3',
                'max:30',
                'unique:users,username',
                'regex:/^[a-zA-Z0-9_]+$/'
            ],
            'email' => [
                'required',
                'email',
                'unique:users,email'
            ],
            'password' => [
                'required',
                'string',
                'min:8'
            ]
        ]);

        $user = User::create([
            'username' => $validated['username'],
            'email' => $validated['email'],
            'password' => $validated['password']
        ]);

        return response()->json([], 201);
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return response()->json([], 200);
    }

    public function me(Request $request)
    {
        return response()->json($request->user(), 200);
    }

    public function update_profile(Request $request) {
        $user = $request->user();

        $validated = $request->validate([
            'username' => [
                'required',
                'string',
                'min:3',
                'max:30',
                Rule::unique('users', 'username')->ignore($user->id),
                'regex:/^[a-zA-Z0-9_]+$/'
            ],
            'email' => [
                'required',
                'email',
                Rule::unique('users', 'email')->ignore($user->id),
                ]
        ]);


        User::find($user->id)->update([
            'username' => $validated['username'],
            'email' => $validated['email']
        ]);

        return response()->json([], 201);
    }
}

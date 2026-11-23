<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AccountController extends Controller
{
    /** Ganti username dan/atau password admin yang sedang login. Password lama wajib diisi. */
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        $d = $request->validate([
            'username'         => ['required', 'string', 'min:3', 'max:50', 'regex:/^[A-Za-z0-9._-]+$/', Rule::unique('users', 'username')->ignore($user->id)],
            'current_password' => 'required|string',
            'password'         => 'nullable|string|min:8|max:100|confirmed',
        ]);

        if (! Hash::check($d['current_password'], $user->password)) {
            throw ValidationException::withMessages(['current_password' => 'Password saat ini salah.']);
        }

        $user->username = $d['username'];
        if (! empty($d['password'])) {
            $user->password = $d['password']; // otomatis di-hash oleh model User
        }
        $user->save();

        $request->session()->regenerate();

        return response()->json(['username' => $user->username]);
    }
}

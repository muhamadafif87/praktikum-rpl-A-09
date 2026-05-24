<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\PersonalAccessToken as SanctumPersonalAccessToken;

class AuthService{
    public function register(array $data): array
    {
        $user = User::create([
            'nama_lengkap'   => $data['nama_lengkap'],
            'email'          => $data['email'],
            'password'       => Hash::make($data['password']),
            'nomor_telepon'  => $data['nomor_telepon'],
            'alamat_kost'    => $data['alamat_kost'],
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return compact('user', 'token');
    }

    /**
     * Attempt login and return token.
     *
     * @throws AuthenticationException
     */
    public function login(array $credentials): array
    {
        if (! Auth::attempt($credentials)) {
            throw new AuthenticationException('Email atau password salah.');
        }

        /** @var User $user */
        $user = Auth::user();

        // Revoke all previous tokens (single session policy)
        $user->tokens()->delete();

        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'user'  => $user,
            'token' => $token,
        ];
    }

    /**
     * Revoke current token (logout).
     */
    public function logout(User $user): void
    {
        $token = $user->currentAccessToken();
        if ($token instanceof SanctumPersonalAccessToken) {
            $token->delete();
            return;
        }

        if (is_object($token) && method_exists($token, 'delete')) {
            $token->delete();
        }
    }
}

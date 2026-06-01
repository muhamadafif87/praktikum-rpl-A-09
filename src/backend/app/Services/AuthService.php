<?php

namespace App\Services;

use App\Models\User;
use App\Models\Admin;
use App\Models\Mitra;
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
     * @throws AuthenticationException
     */
    public function detectGuard(string $email){
        $guardMap = [
            'admin' => Admin::class,
            'mitra' => Mitra::class,
            'web' => User::class,
        ];

        foreach ($guardMap as $guard => $model){
            $user = $model::where('email', $email)->first();
            if($user){
                return ['guard' => $guard, 'model' => $user];
            }
        }

        throw new AuthenticationException('Email atau password yang digunakan salah!');
    }

    /**
     * Attempt login and return token.
     *
     * @throws AuthenticationException
     *
     * @var User|Admin|Mitra
     *
     */
    public function login(array $credentials): array {
        ['guard' => $guard] = $this->detectGuard($credentials['email']);

        if (! Auth::guard($guard)->attempt($credentials)) {
            throw new AuthenticationException('Email atau password salah.');
        }

        $user = Auth::guard($guard)->user();

        if($guard === 'mitra' && isset($user->status_verifikasi) && $user->status_verifikasi !== 'aktif'){
            Auth::guard($guard)->logout();
            throw new AuthenticationException(
                match($user->status_verifikasi){
                    'pending' => 'Akun mitra anda sedang dalam proses verifikasi',
                    'nonaktif' => 'Akun mitra anda telah dinonaktifkan',
                    default => 'Akun anda tidak dapat digunakan',
                }
            );
        }

        $user->tokens()->delete();
        $token = $user->createToken("{$guard}_token")->plainTextToken;

        return compact('user', 'token', 'guard');
    }

    /**
     * Revoke current token (logout).
     */
    public function logout(string $guard, \Illuminate\Foundation\Auth\User $user): void
    {
        $user->tokens()->delete();

        Auth::guard($guard)->logout();
    }
}

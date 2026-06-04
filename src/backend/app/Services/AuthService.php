<?php

namespace App\Services;

use App\Models\User;
use App\Models\Admin;
use App\Models\Mitra;
use App\Models\MitraLoginAccess;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\PersonalAccessToken as SanctumPersonalAccessToken;

class AuthService{
    public function register(array $data): array
    {
        $registAs = $data['regist_as'] ?? 'user';

        return match ($registAs) {
            'mitra' => $this->registerMitra($data),
            default => $this->registerUser($data),
        };
    }

    private function registerUser(array $data): array
    {
        $user = User::create([
            'nama_lengkap'   => $data['nama_lengkap'],
            'email'          => $data['email'],
            'password'       => Hash::make($data['password']),
            'nomor_telepon'  => $data['nomor_telepon']
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return compact('user', 'token');
    }

    private function registerMitra(array $data): array
    {
        $mitra = Mitra::create([
            'nama_mitra'      => $data['nama_mitra'],
            'jenis_jasa'      => $data['jenis_jasa'],
            'alamat_mitra'    => $data['alamat_mitra'],
            'nomor_telepon'   => $data['nomor_telepon'],
            'status_verifikasi' => 'pending'
        ]);

        $mitraLoginAccess = MitraLoginAccess::create([
            'id_mitra'    => $mitra->id_mitra,
            'email'       => $data['email'],
            'password'    => Hash::make($data['password']),
        ]);

        $token = $mitraLoginAccess->createToken('mitra_auth_token')->plainTextToken;

        return [
            'mitra'  => $mitra,
            'token'  => $token,
            'guard'  => 'mitra'
        ];
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

        foreach ($guardMap as $guard => $model) {
            if ($guard === 'mitra') {
                $user = Mitra::whereHas('MitraAccess', function ($q) use ($email) {
                    $q->where('email', $email);
                })->with('MitraAccess')->first();
            } else {
                $user = $model::where('email', $email)->first();
            }

            if ($user) {
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
     * @var User|Admin|Mitra $user
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

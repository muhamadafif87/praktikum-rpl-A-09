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
    public function detectGuard(string $credential){
        $guardMap = [
            'mitra' => Mitra::class,
            'admin' => Admin::class,
            'web' => User::class,
        ];

        foreach ($guardMap as $guard => $model) {
            if ($guard === 'mitra') {
                $mitraAccess = MitraLoginAccess::where('email', $credential)->first();
                if ($mitraAccess) {
                    $user = Mitra::find($mitraAccess->id_mitra);
                } else {
                    $user = Mitra::where('nomor_telepon', $credential)->first();
                }
            }
            else {
                $user = $model::where('email', $credential)
                              ->orWhere('nomor_telepon', $credential)
                              ->first();
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

        if ($guard === 'mitra') {
            $mitraAccess = MitraLoginAccess::where('email', $credentials['email'])->first();
            if ($mitraAccess) {
                $mitra = Mitra::with('MitraAccess')->find($mitraAccess->id_mitra);
            } else {
                $mitra = Mitra::with('MitraAccess')->where('nomor_telepon', $credentials['email'])->first();
            }

            if (! $mitra || ! Hash::check($credentials['password'], $mitra->MitraAccess->password)) {
                throw new AuthenticationException('Email/nomor telepon atau password salah.');
            }

            if ($mitra->status_verifikasi !== true) {
                throw new AuthenticationException(
                    match($mitra->status_verifikasi) {
                        'pending'   => 'Akun mitra anda sedang dalam proses verifikasi',
                        'nonaktif'  => 'Akun mitra anda telah dinonaktifkan',
                        default     => 'Akun anda tidak dapat digunakan',
                    }
                );
            }

            Auth::guard('mitra')->login($mitra);
            $user = $mitra;
        }
        else {
            // Check if the credential is an email or phone number
            $authField = filter_var($credentials['email'], FILTER_VALIDATE_EMAIL) ? 'email' : 'nomor_telepon';
            
            $attemptCredentials = [
                $authField => $credentials['email'],
                'password' => $credentials['password']
            ];

            if (! Auth::guard($guard)->attempt($attemptCredentials)) {
                throw new AuthenticationException('Email/nomor telepon atau password salah.');
            }

            $user = Auth::guard($guard)->user();
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

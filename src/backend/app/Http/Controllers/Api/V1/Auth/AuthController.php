<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function __construct(
        private readonly AuthService $authService
    ) {}

    /**
     * POST /api/v1/auth/register
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $result = $this->authService->register($request->validated());
        $registAs = $request->input('regist_as', 'user');

        if ($registAs === 'mitra') {
            $data = [
                'mitra' => $result['mitra'],
                'token' => $result['token'],
                'guard' => $result['guard'],
            ];
            $message = 'Registrasi mitra berhasil. Akun Anda sedang dalam proses verifikasi.';
        } else {
            $data = [
                'user'  => $result['user'],
                'token' => $result['token'],
                'guard' => 'web',
            ];
            $message = 'Registrasi berhasil.';
        }

        return response()->json([
            'message' => $message,
            'data'    => $data,
        ], 201);
    }

    /**
     * POST /api/v1/auth/login
     */
    public function login(LoginRequest $request): JsonResponse
    {
        try {
            $result = $this->authService->login($request->validated());

            return response()->json([
                'message' => 'Login berhasil.',
                'data'    => [
                    'guard'      => $result['guard'],
                    'user'       => $result['user'],
                    'token'      => $result['token']
                ],
            ]);

        } catch (AuthenticationException $e) {
            return response()->json(['message' => $e->getMessage()], 401);
        }
    }

    /**
     * POST /api/v1/auth/logout
     */
    public function logout(Request $request): JsonResponse
    {
        $activeGuard = $this->resolveActiveGuard();
        $this->authService->logout($activeGuard, $request->user());

        return response()->json(['message' => 'Logout berhasil.']);
    }

    /**
     * GET /api/v1/auth/me
     */
    public function me(Request $request): JsonResponse
    {
        $activeGuard = $this->resolveActiveGuard();

        return response()->json([
            'data'  => $request->user(),
            'guard' => $activeGuard,
        ]);
    }

    private function resolveActiveGuard(): ?string
    {
        foreach (['admin', 'mitra', 'web'] as $guard) {
            if (Auth::guard($guard)->check()) {
                return $guard;
            }
        }
        return null;
    }
}

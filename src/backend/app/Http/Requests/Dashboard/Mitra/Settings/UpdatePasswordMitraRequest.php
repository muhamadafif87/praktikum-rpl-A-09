<?php

namespace App\Http\Requests\Dashboard\Mitra\Settings;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Hash;
use Illuminate\Contracts\Validation\Validator;

class UpdatePasswordMitraRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'password_lama'         => ['required', 'string'],
            'password_baru'         => ['required', 'string', 'min:8', 'different:password_lama'],
            'konfirmasi_password'   => ['required', 'string', 'same:password_baru'],
        ];
    }

    public function messages(): array
    {
        return [
            'password_lama.required'        => 'Password lama wajib diisi.',
            'password_baru.required'        => 'Password baru wajib diisi.',
            'password_baru.min'             => 'Password baru minimal 8 karakter.',
            'password_baru.different'       => 'Password baru tidak boleh sama dengan password lama.',
            'konfirmasi_password.required'  => 'Konfirmasi password wajib diisi.',
            'konfirmasi_password.same'      => 'Konfirmasi password tidak cocok dengan password baru.',
        ];
    }

    /**
     * Validasi tambahan: cek apakah password_lama cocok dengan hash di DB.
     * Dipanggil dari service agar bisa akses model MitraLoginAccess.
     */
    public function verifyOldPassword(string $hashedPassword): bool
    {
        return Hash::check($this->input('password_lama'), $hashedPassword);
    }

    protected function failedValidation(Validator $validator): never
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Validasi gagal.',
            'errors'  => $validator->errors(),
        ], 422));
    }
}

<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nama_lengkap'  => ['required', 'string', 'max:155'],
            'email'         => ['required', 'email', 'max:255', 'unique:users,email'],
            'password'      => ['required', 'string', 'min:8', 'confirmed'],
            'nomor_telepon' => ['required', 'string', 'max:25', 'unique:users,nomor_telepon'],
            'alamat_kost'   => ['required', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.unique'         => 'Email sudah terdaftar.',
            'password.confirmed'   => 'Konfirmasi password tidak cocok.',
        ];
    }
}

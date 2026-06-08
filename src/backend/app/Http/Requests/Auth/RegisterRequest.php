<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $registAs = $this->input('regist_as', 'user');

        $baseRules = [
            'regist_as'     => ['nullable', Rule::in(['user', 'mitra']), 'default:user'],
            'nama_lengkap'  => ['required', 'string', 'max:155'],
            'email'         => ['required', 'email', 'max:255', $this->getEmailUniqueRule()],
            'password'      => ['required', 'string', 'min:8', 'confirmed'],
            'nomor_telepon' => ['required', 'string', 'max:25', $this->getPhoneUniqueRule()],
        ];

        // Tambahan validasi jika registrasi sebagai mitra
        if ($registAs === 'mitra') {
            $baseRules = array_merge($baseRules, [
                'nama_mitra'  => ['required', 'string', 'max:155'],
                'jenis_jasa'  => ['required', 'string', 'max:100'],
                'alamat_mitra' => ['required', 'string', 'max:255'],
            ]);
        }

        return $baseRules;
    }

    public function messages(): array
    {
        return [
            'email.unique'         => 'Email sudah terdaftar.',
            'password.confirmed'   => 'Konfirmasi password tidak cocok.',
            'regist_as.required'   => 'Tipe registrasi harus dipilih.',
            'regist_as.in'         => 'Tipe registrasi hanya boleh user atau mitra.',
            'nama_mitra.required'  => 'Nama mitra harus diisi.',
            'jenis_jasa.required'  => 'Jenis jasa harus diisi.',
            'alamat_mitra.required' => 'Alamat mitra harus diisi.',
        ];
    }

    /**
     * Get unique email rule based on registration type
     */
    private function getEmailUniqueRule()
    {
        $registAs = $this->input('regist_as', 'user');

        if ($registAs === 'mitra') {
            return Rule::unique('mitra_login_access', 'email');
        }

        return Rule::unique('users', 'email');
    }

    /**
     * Get unique phone rule based on registration type
     */
    private function getPhoneUniqueRule()
    {
        $registAs = $this->input('regist_as', 'user');

        if ($registAs === 'mitra') {
            return Rule::unique('mitra', 'nomor_telepon');
        }

        return Rule::unique('users', 'nomor_telepon');
    }
}

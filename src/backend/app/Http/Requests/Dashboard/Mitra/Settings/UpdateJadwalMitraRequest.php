<?php

namespace App\Http\Requests\Dashboard\Mitra\Settings;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class UpdateJadwalMitraRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Jadwal dikirim sebagai array string waktu (format HH:MM).
     *
     * Contoh payload:
     * {
     *   "jadwal": ["09:00", "10:00", "11:00", "14:00"]
     * }
     *
     * Backend akan menentukan sendiri key yang diupdate
     * (jadwal_penjemputan atau jadwal_pengiriman) berdasarkan jenis_jasa mitra.
     */
    public function rules(): array
    {
        return [
            'jadwal'    => ['required', 'array', 'min:1'],
            'jadwal.*'  => ['required', 'string', 'regex:/^\d{2}:\d{2}$/'],
        ];
    }

    public function messages(): array
    {
        return [
            'jadwal.required'   => 'Jadwal wajib diisi.',
            'jadwal.array'      => 'Jadwal harus berupa array.',
            'jadwal.min'        => 'Minimal harus ada satu slot jadwal.',
            'jadwal.*.required' => 'Setiap item jadwal wajib diisi.',
            'jadwal.*.string'   => 'Setiap item jadwal harus berupa string.',
            'jadwal.*.regex'    => 'Format jadwal tidak valid. Gunakan format HH:MM (contoh: 09:00).',
        ];
    }

    /**
     * Normalisasi: buang duplikat dan urutkan jadwal secara ascending.
     */
    protected function passedValidation(): void
    {
        $jadwal = $this->input('jadwal', []);

        $jadwal = array_values(array_unique($jadwal));
        sort($jadwal);

        $this->merge(['jadwal' => $jadwal]);
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

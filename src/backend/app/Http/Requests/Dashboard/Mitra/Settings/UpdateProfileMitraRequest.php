<?php

namespace App\Http\Requests\Dashboard\Mitra\Settings;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;

class UpdateProfileMitraRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nama_mitra'      => ['required', 'string', 'max:255'],
            'deskripsi'       => ['nullable', 'string', 'max:1000'],
            'alamat_mitra'    => ['required', 'string', 'max:500'],
            'nomor_telepon'   => ['required', 'string', 'max:20'],
            'latitude'        => ['nullable', 'numeric', 'between:-90,90'],
            'longitude'       => ['nullable', 'numeric', 'between:-180,180'],
            'radius_layanan'  => ['nullable', 'integer', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'nama_mitra.required'     => 'Nama mitra wajib diisi.',
            'nama_mitra.max'          => 'Nama mitra maksimal 255 karakter.',
            'deskripsi.max'           => 'Deskripsi maksimal 1000 karakter.',
            'alamat_mitra.required'   => 'Alamat mitra wajib diisi.',
            'alamat_mitra.max'        => 'Alamat maksimal 500 karakter.',
            'nomor_telepon.required'  => 'Nomor telepon wajib diisi.',
            'nomor_telepon.max'       => 'Nomor telepon maksimal 20 karakter.',
            'latitude.numeric'        => 'Latitude harus berupa angka.',
            'latitude.between'        => 'Latitude harus bernilai antara -90 dan 90.',
            'longitude.numeric'       => 'Longitude harus berupa angka.',
            'longitude.between'       => 'Longitude harus bernilai antara -180 dan 180.',
            'radius_layanan.integer'  => 'Radius layanan harus berupa bilangan bulat.',
            'radius_layanan.min'      => 'Radius layanan tidak boleh bernilai negatif.',
        ];
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

<?php

namespace App\Http\Requests\Dashboard\Mitra;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreMitraImageAssetRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'id_mitra'    => ['required', 'integer', 'exists:mitra,id_mitra'],
            'description' => ['nullable', 'string', 'max:255'],
            'image'       => ['required', 'image', 'mimes:jpeg,jpg,png,webp', 'max:5120'],
        ];
    }

    public function messages(): array
    {
        return [
            'id_mitra.required' => 'id_mitra wajib diisi.',
            'id_mitra.exists'   => 'Mitra dengan id tersebut tidak ditemukan.',
            'image.required'    => 'File gambar wajib diupload.',
            'image.image'       => 'File harus berupa gambar.',
            'image.mimes'       => 'Format gambar harus jpeg, jpg, png, atau webp.',
            'image.max'         => 'Ukuran gambar maksimal 5 MB.',
        ];
    }

    /**
     * Override failedValidation agar selalu return JSON,
     */
    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(
            response()->json([
                'success' => false,
                'message' => 'Validasi gagal.',
                'errors'  => $validator->errors(),
            ], 422)
        );
    }
}

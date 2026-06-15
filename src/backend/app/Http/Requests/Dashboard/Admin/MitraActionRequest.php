<?php

namespace App\Http\Requests\Dashboard\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class MitraActionRequest extends FormRequest
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
            'id_mitra' => ['required', 'integer', 'exists:mitra,id_mitra'],
            'action'   => ['required', 'string', 'in:activate,suspend'],
        ];
    }

    public function messages(): array
    {
        return [
            'id_mitra.required' => 'ID mitra wajib diisi.',
            'id_mitra.exists'   => 'Mitra tidak ditemukan.',
            'action.required'   => 'Action wajib diisi.',
            'action.in'         => 'Action tidak valid. Pilihan: activate, suspend.',
        ];
    }
}

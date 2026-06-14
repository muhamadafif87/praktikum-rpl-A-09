<?php

namespace App\Http\Requests\Dashboard\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class MitraFilterRequest extends FormRequest
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
            'search'        => ['nullable', 'string', 'max:255'],
            'jenis_layanan' => ['nullable', 'string', 'in:galon_gas,laundry,daily_cleaning'],
            'status'        => ['nullable', 'string', 'in:aktif,suspend'],
            'rating'        => ['nullable', 'integer', 'min:1', 'max:5'],
            'page'          => ['nullable', 'integer', 'min:1'],
            'per_page'      => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'jenis_layanan.in' => 'Jenis layanan tidak valid. Pilihan: galon_gas, laundry, daily_cleaning.',
            'status.in'        => 'Status tidak valid. Pilihan: aktif, suspend.',
            'rating.min'       => 'Rating minimal 1.',
            'rating.max'       => 'Rating maksimal 5.',
        ];
    }
}

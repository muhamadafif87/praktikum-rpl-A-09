<?php

namespace App\Http\Requests\Dashboard\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class InventoryFilterRequest extends FormRequest
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
            'filter_mitra'       => ['nullable', 'string'],
            'filter_status_stok' => ['nullable', 'string', 'in:All,In Stock,Low Stock,Out of Stock'],
            'page'               => ['nullable', 'integer', 'min:1'],
            'per_page'           => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'filter_status_stok.in' => 'Status stok tidak valid. Pilihan: All, In Stock, Low Stock, Out of Stock.',
        ];
    }
}

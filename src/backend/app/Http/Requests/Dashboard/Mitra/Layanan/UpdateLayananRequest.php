<?php

namespace App\Http\Requests\Dashboard\Mitra\Layanan;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreLayananRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nama_layanan' => ['required', 'string', 'max:100'],
            'harga'        => ['required', 'numeric', 'min:0'],
            'satuan'       => ['nullable', 'string', 'max:50'],
            'stok_tersedia' => ['nullable', 'numeric', 'min:0'],
            'catatan'      => ['nullable', 'array'],
        ];
    }
}

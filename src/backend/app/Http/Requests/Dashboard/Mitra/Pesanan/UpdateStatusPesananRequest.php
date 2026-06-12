<?php

namespace App\Http\Requests\Dashboard\Mitra\Pesanan;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\Pesanan;

class UpdateStatusPesananRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status_pesanan' => [
                'required',
                'string',
                'in:' . implode(',', Pesanan::STATUSES),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'status_pesanan.in' => 'Status tidak valid. Nilai yang diizinkan: ' . implode(', ', Pesanan::STATUSES),
        ];
    }
}

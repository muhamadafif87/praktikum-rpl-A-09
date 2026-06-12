<?php

namespace App\Http\Requests\Dashboard\Mitra\TransaksiKeuangan;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class IndexTransaksiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'search'      => ['nullable', 'string', 'max:100'],
            'status_dana' => ['nullable', 'string', 'in:all,tersedia,tertahan'],
            'page'        => ['nullable', 'integer', 'min:1'],
            'limit'       => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }
}

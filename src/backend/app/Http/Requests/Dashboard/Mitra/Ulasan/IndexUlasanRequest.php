<?php

namespace App\Http\Requests\Dashboard\Mitra\Ulasan;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class IndexUlasanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'rating' => ['nullable', 'integer', 'min:1', 'max:5'],
            'search' => ['nullable', 'string', 'max:100'],
            'page'   => ['nullable', 'integer', 'min:1'],
            'limit'  => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }
}

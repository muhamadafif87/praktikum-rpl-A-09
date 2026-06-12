<?php

namespace App\Http\Requests\Dashboard\Mitra\Pesanan;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\Pesanan;

class IndexPesananRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // guard 'mitra' sudah handle auth di route
    }

    public function rules(): array
    {
        $validStatuses = implode(',', array_map(
            fn($s) => strtolower(str_replace(' ', '_', $s)),
            Pesanan::STATUSES
        ));

        return [
            'search' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', 'string', 'in:all,pending,proses,siap,selesai,dibatalkan'],
            'page'   => ['nullable', 'integer', 'min:1'],
            'limit'  => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }
}

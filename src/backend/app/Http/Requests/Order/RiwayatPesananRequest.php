<?php

namespace App\Http\Requests\Order;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RiwayatPesananRequest extends FormRequest
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
            'status'    => ['nullable', Rule::in(['pending', 'diproses', 'selesai', 'dibatalkan'])],
            'tgl_dari'  => ['nullable', 'date'],
            'tgl_sampai'=> ['nullable', 'date', 'after_or_equal:tgl_dari'],
            'per_page'  => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'status.in'                   => 'Status tidak valid. Pilihan: pending, diproses, selesai, dibatalkan.',
            'tgl_dari.date'               => 'Format tgl_dari tidak valid.',
            'tgl_sampai.date'             => 'Format tgl_sampai tidak valid.',
            'tgl_sampai.after_or_equal'   => 'tgl_sampai harus sama dengan atau setelah tgl_dari.',
            'per_page.integer'            => 'per_page harus berupa angka.',
            'per_page.max'                => 'per_page maksimal 100.',
        ];
    }
}

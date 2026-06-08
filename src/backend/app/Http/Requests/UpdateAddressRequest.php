<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateAddressRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'alamat_kost' => 'required|string|max:500',
            'address_detail' => 'nullable|string|max:500',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
        ];
    }

    public function messages(): array
    {
        return [
            'alamat_kost.required' => 'Alamat wajib diisi.',
            'latitude.required' => 'Koordinat latitude diperlukan.',
            'longitude.required' => 'Koordinat longitude diperlukan.',
        ];
    }
}

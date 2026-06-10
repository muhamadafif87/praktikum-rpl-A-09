<?php

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GenerateFeeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    protected function prepareForValidation()
    {
        if ($this->has('biayaTambahan') && is_string($this->input('biayaTambahan'))) {
            $decoded = json_decode($this->input('biayaTambahan'), true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $this->merge(['biayaTambahan' => $decoded]);
            }
        }

        if (!$this->has('biayaTambahan')) {
            $this->merge(['biayaTambahan' => []]);
        }

        if ($this->has('biayaTambahan') && is_array($this->input('biayaTambahan'))) {
            $converted = [];
            foreach ($this->input('biayaTambahan') as $k => $v) {
                if (is_numeric($v)) {
                    $converted[$k] = $v + 0;
                } else {
                    $converted[$k] = $v;
                }
            }
            $this->merge(['biayaTambahan' => $converted]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        $serviceTypes = ['laundry', 'galon_gas', 'daily_cleaning'];

        return  [
            'idMitra'       => ['required', 'string', 'exists:mitra,id_mitra'],
            'typeLayanan'   => ['required', 'string', Rule::in($serviceTypes)],
            'items'       => ['required', 'array', 'min:1'],
            'items.*.idLayanan' => ['required', 'string', 'exists:layanan,id_layanan'],
            'items.*.qty'       => ['required', 'integer', 'min:1'],

            'layanan' => [
                function ($attribute, $value, $fail) {
                    if (request()->input('typeLayanan') === 'laundry' && count($value) > 1) {
                        $fail('Untuk layanan laundry, hanya boleh memesan 1 layanan dalam satu waktu.');
                    }
                },
            ],

            'jarakOngkir'   => ['required', 'integer', 'min:0'],

            'biayaTambahan' => ['nullable', 'array'],
            'biayaTambahan.*.idLayanan' => ['required_if:typeLayanan,galon_gas', 'string'],
            'biayaTambahan.*.beli_baru' => [
                'required_if:typeLayanan,galon_gas', 'nullable', 'numeric', 'min:0'
            ],

            'biayaTambahan.durasi_pengerjaan' => [
                'required_if:typeLayanan,laundry', 'nullable', 'array'
            ],
            'biayaTambahan.durasi_pengerjaan.biaya' => [
                'required_with:biayaTambahan.durasi_pengerjaan', 'numeric', 'min:0'
            ],
            'biayaTambahan.durasi_pengerjaan.type' => [
                'required_with:biayaTambahan.durasi_pengerjaan', 'string'
            ],

            'biayaTambahanAlat' => ['nullable', 'array'],
            'biayaTambahanAlat.*' => ['numeric', 'min:0']
        ];

    }

    /**
     * Custom messages for validation errors.
     *
     * @return array
     */
    public function messages()
    {
        return [
            'idMitra.required' => 'idMitra wajib diisi.',
            'idMitra.exists' => 'Mitra tidak ditemukan.',
            'typeLayanan.required' => 'typeLayanan wajib diisi.',
            'typeLayanan.in' => 'typeLayanan harus salah satu dari: laundry, galon_gas, lainnya.',
            'qty.required' => 'qty wajib diisi.',
            'qty.integer' => 'qty harus berupa angka bulat.',
            'qty.min' => 'qty minimal 1.',
            'jarakOngkir.required' => 'jarakOngkir wajib diisi.',
            'jarakOngkir.integer' => 'jarakOngkir harus berupa angka.',
            'jarakOngkir.min' => 'jarakOngkir minimal 0.',
            'biayaTambahan.array' => 'biayaTambahan harus berupa array atau JSON object.',
            'biayaTambahan.*.numeric' => 'Setiap nilai biayaTambahan harus berupa angka.',
            'biayaTambahan.beli_baru.required_if' => 'Untuk layanan galon_gas, biayaTambahan.beli_baru wajib diisi.',
            'biayaTambahan.beli_baru.numeric' => 'biayaTambahan.beli_baru harus berupa angka.',
            'layanan.*.qty.required' => 'Qty untuk setiap layanan wajib diisi',
            'layanan.*.qty.min' => 'Qty minimal 1 untuk setiap layanan',
            'biayaTambahan.*.idLayanan.required_if' => 'ID Layanan untuk biaya tambahan wajib diisi'
        ];
    }
}

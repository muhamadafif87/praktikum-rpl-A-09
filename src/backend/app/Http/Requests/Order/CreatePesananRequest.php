<?php

namespace App\Http\Requests\Order;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreatePesananRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
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
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'idMitra'     => ['required', 'string', 'exists:mitra,id_mitra'],
            'typeLayanan' => ['required', 'string', Rule::in(['laundry', 'galon_gas', 'daily_cleaning'])],

            'items'             => ['required', 'array', 'min:1'],
            'items.*.idLayanan' => ['required', 'string', 'exists:layanan,id_layanan'],
            'items.*.qty'       => ['required', 'integer', 'min:1'],

            'jarakOngkir' => ['required', 'numeric', 'min:0'],

            'jadwal_layanan'            => ['required', 'array', 'min:1'],
            'jadwal_layanan.*.jam'      => ['required', 'date_format:H:i'],
            'jadwal_layanan.*.tanggal'  => ['nullable', 'date', 'required_if:typeLayanan,daily_cleaning'],

            'biayaTambahan'                         => ['nullable', 'array'],
            'biayaTambahan.beli_baru'               => ['nullable', 'numeric', 'min:0'],
            'biayaTambahan.durasi_pengerjaan'      => ['nullable', 'array'],
            'biayaTambahan.durasi_pengerjaan.biaya'=> ['required_with:biayaTambahan.durasi_pengerjaan','numeric','min:0'],
            'biayaTambahan.durasi_pengerjaan.type' => ['required_with:biayaTambahan.durasi_pengerjaan','string'],

            'estimasi'                      => ['required', 'array'],
            'estimasi.subtotal'             => ['required', 'numeric', 'min:0'],
            'estimasi.biaya_ongkir'         => ['nullable', 'numeric', 'min:0'],
            'estimasi.total_pembayaran'     => ['required', 'numeric', 'min:0'],
            'estimasi.beli_baru'            => ['nullable', 'numeric', 'min:0'],
            'estimasi.biaya_transportasi'   => ['nullable', 'numeric', 'min:0'],
            'estimasi.biaya_tambahan_alat'  => ['nullable', 'numeric', 'min:0'],

            'catatanPengiriman'       => ['nullable', 'string', 'max:500'],
            'namaPengirim'            => ['nullable', 'string', 'max:255'],
            'nomorWhatsAppPengirim'   => ['nullable', 'string', 'max:20'],
        ];
    }

    public function messages(): array
    {
        return [
            'idMitra.required'                    => 'Mitra wajib dipilih.',
            'idMitra.exists'                      => 'Mitra tidak ditemukan.',
            'typeLayanan.required'                => 'Tipe layanan wajib diisi.',
            'typeLayanan.in'                      => 'Tipe layanan tidak valid.',
            'items.required'                      => 'Pilih minimal 1 item layanan.',
            'items.min'                           => 'Minimal 1 item layanan.',
            'items.*.idLayanan.required'          => 'Layanan wajib dipilih.',
            'items.*.idLayanan.exists'            => 'Salah satu layanan tidak ditemukan.',
            'items.*.qty.required'                => 'Kuantitas wajib diisi.',
            'items.*.qty.min'                     => 'Kuantitas minimal 1.',
            'jarakOngkir.required'                => 'Jarak pengiriman wajib dihitung (Pastikan lokasi sudah diatur).',
            'jarakOngkir.min'                     => 'Jarak pengiriman minimal 0.',
            
            'jadwal_layanan.required'             => 'Jadwal layanan wajib diatur.',
            'jadwal_layanan.min'                  => 'Jadwal layanan wajib diatur.',
            'jadwal_layanan.*.jam.required'       => 'Silakan pilih jam layanan (penjemputan/pengiriman) terlebih dahulu.',
            'jadwal_layanan.*.jam.date_format'    => 'Format jam tidak valid.',
            'jadwal_layanan.*.tanggal.required_if'=> 'Silakan pilih tanggal layanan terlebih dahulu.',
            'jadwal_layanan.*.tanggal.date'       => 'Format tanggal tidak valid.',

            'estimasi.required'                   => 'Mohon tunggu sistem menghitung estimasi biaya terlebih dahulu.',
            'estimasi.subtotal.required'          => 'Estimasi subtotal gagal dihitung.',
            'estimasi.biaya_ongkir.required'      => 'Estimasi biaya ongkir gagal dihitung.',
            'estimasi.total_pembayaran.required'  => 'Estimasi total pembayaran gagal dihitung.',
            'biayaTambahan.beli_baru.required_if' => 'Untuk galon_gas, biayaTambahan.beli_baru wajib diisi.',
            
            'catatanPengiriman.max'               => 'Catatan pengiriman maksimal 500 karakter.',
            'namaPengirim.max'                    => 'Nama maksimal 255 karakter.',
            'nomorWhatsAppPengirim.max'           => 'Nomor WhatsApp maksimal 20 karakter.',
        ];
    }
}

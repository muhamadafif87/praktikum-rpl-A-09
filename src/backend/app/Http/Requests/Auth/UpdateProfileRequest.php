<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Get the current user ID to ignore in unique checks
        $userId = $this->user()->id_user ?? $this->user()->id_mitra;
        $table = $this->user()->getTable();
        $primaryKey = $this->user()->getKeyName();

        return [
            'nama_lengkap' => 'sometimes|string|max:155',
            'nama_mitra'   => 'sometimes|string|max:155',
            'nomor_telepon'=> "sometimes|string|max:25|unique:{$table},nomor_telepon,{$userId},{$primaryKey}",
            'alamat_kost'  => 'nullable|string',
            'latitude'     => 'nullable|numeric',
            'longitude'    => 'nullable|numeric',
            'address_detail'=> 'nullable|string',
            'old_password' => 'nullable|string',
            'new_password' => 'nullable|string|min:6|confirmed',
        ];
    }
}

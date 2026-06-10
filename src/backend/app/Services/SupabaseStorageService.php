<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use Exception;

class SupabaseStorageService
{
    protected string $bucket;
    protected string $url;
    protected string $key;
    protected string $serviceRole;

    public function __construct()
    {
        $this->bucket = config('supabase.bucket', 'mitra-assets');
        $this->url = config('supabase.url');
        $this->key = config('supabase.key');
        $this->serviceRole = config('supabase.service_role');
    }

    /**
     * Upload file to Supabase Storage
     */
    public function upload(UploadedFile $file, string $path = '', string $filename = null): string
    {
        try {
            $filename = $filename ?? $this->generateFileName($file);
            $fullPath = $path ? $path . '/' . $filename : $filename;

            $content = file_get_contents($file->getRealPath());
            $mimeType = $file->getMimeType();

            $ch = curl_init();

            curl_setopt_array($ch, [
                CURLOPT_URL => $this->url . "/storage/v1/object/{$this->bucket}/{$fullPath}",
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_CUSTOMREQUEST => 'PUT',
                CURLOPT_POSTFIELDS => $content,
                CURLOPT_HTTPHEADER => [
                    'Authorization: Bearer ' . $this->serviceRole,
                    'Content-Type: ' . $mimeType,
                ],
            ]);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($httpCode !== 200 && $httpCode !== 201) {
                throw new Exception("Upload failed: " . $response);
            }

            // Return public URL
            return $this->getPublicUrl($fullPath);

        } catch (Exception $e) {
            throw new Exception("Failed to upload to Supabase: " . $e->getMessage());
        }
    }

    /**
     * Delete file from Supabase Storage
     */
    public function delete(string $fileUrl): bool
    {
        try {
            // Extract path from URL
            $path = $this->extractPathFromUrl($fileUrl);

            $ch = curl_init();

            curl_setopt_array($ch, [
                CURLOPT_URL => $this->url . "/storage/v1/object/{$this->bucket}/{$path}",
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_CUSTOMREQUEST => 'DELETE',
                CURLOPT_HTTPHEADER => [
                    'Authorization: Bearer ' . $this->serviceRole,
                ],
            ]);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            return $httpCode === 200;

        } catch (Exception $e) {
            throw new Exception("Failed to delete from Supabase: " . $e->getMessage());
        }
    }

    /**
     * Update file in Supabase Storage
     */
    public function update(string $oldFileUrl, UploadedFile $newFile, string $path = ''): string
    {
        // Delete old file
        $this->delete($oldFileUrl);

        // Upload new file
        return $this->upload($newFile, $path);
    }

    /**
     * Get public URL for a file
     */
    public function getPublicUrl(string $path): string
    {
        return $this->url . "/storage/v1/object/public/{$this->bucket}/{$path}";
    }

    /**
     * Generate unique filename
     */
    protected function generateFileName(UploadedFile $file): string
    {
        return Str::uuid() . '.' . $file->getClientOriginalExtension();
    }

    /**
     * Extract path from public URL
     */
    protected function extractPathFromUrl(string $url): string
    {
        $pattern = "/storage/v1/object/public/{$this->bucket}/(.*)/";
        preg_match($pattern, $url, $matches);
        return $matches[1] ?? '';
    }
}

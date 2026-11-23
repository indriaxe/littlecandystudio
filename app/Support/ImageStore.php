<?php

namespace App\Support;

use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Menyimpan gambar kiriman browser (data URL base64) sebagai file di public/uploads/<folder>/.
 * Yang disimpan di database hanya path-nya, misalnya "uploads/products/abc123.jpg".
 */
class ImageStore
{
    private const EXT = [
        'image/jpeg' => 'jpg',
        'image/png'  => 'png',
        'image/webp' => 'webp',
        'image/gif'  => 'gif',
    ];

    private const MAX_BYTES = 4 * 1024 * 1024; // 4 MB

    public static function isDataUrl($value): bool
    {
        return is_string($value) && str_starts_with($value, 'data:image/');
    }

    /** Simpan data URL ke file. Mengembalikan path relatif terhadap folder public/. */
    public static function save(string $dataUrl, string $dir): string
    {
        $pos = strpos($dataUrl, ';base64,');
        if (! self::isDataUrl($dataUrl) || $pos === false || $pos > 40) {
            self::fail();
        }

        $binary = base64_decode(substr($dataUrl, $pos + 8), true);
        if ($binary === false || $binary === '' || strlen($binary) > self::MAX_BYTES) {
            self::fail('Ukuran gambar maksimal 4 MB.');
        }

        // Pastikan isinya benar-benar gambar (bukan file lain yang menyamar)
        $info = @getimagesizefromstring($binary);
        if (! $info || ! isset(self::EXT[$info['mime']])) {
            self::fail('Gambar harus berformat JPG, PNG, WEBP, atau GIF.');
        }

        $relative = 'uploads/' . trim($dir, '/') . '/' . Str::uuid() . '.' . self::EXT[$info['mime']];
        $absolute = public_path($relative);
        if (! is_dir(dirname($absolute))) {
            mkdir(dirname($absolute), 0775, true);
        }
        file_put_contents($absolute, $binary);

        return $relative;
    }

    /**
     * Terima input gambar dari browser:
     *  - data URL baru      -> disimpan jadi file, mengembalikan path baru
     *  - path lama yang sah -> dikembalikan apa adanya
     *  - selain itu         -> string kosong
     */
    public static function resolve($value, string $dir): string
    {
        if (self::isDataUrl($value)) {
            return self::save($value, $dir);
        }
        return self::existing($value) ?? '';
    }

    /** Path gambar yang sudah ada di server (assets/img/... atau uploads/...), atau null bila tidak sah. */
    public static function existing($value): ?string
    {
        if (is_string($value) && preg_match('#^(assets/img|uploads/[a-z]+)/[A-Za-z0-9._-]+$#', $value)) {
            return $value;
        }
        return null;
    }

    /** Hapus file hanya bila memang milik folder uploads/<dir>/ (aset bawaan tidak pernah dihapus). */
    public static function delete(?string $path, string $dir): void
    {
        if (! $path || str_contains($path, '..')) {
            return;
        }
        if (str_starts_with($path, 'uploads/' . trim($dir, '/') . '/')) {
            $absolute = public_path($path);
            if (is_file($absolute)) {
                @unlink($absolute);
            }
        }
    }

    /** Salin file upload ke folder lain (supaya dua data tidak berbagi satu file). */
    public static function copy(?string $path, string $dir): ?string
    {
        $path = self::existing($path);
        if (! $path || ! is_file(public_path($path))) {
            return null;
        }
        $relative = 'uploads/' . trim($dir, '/') . '/' . Str::uuid() . '.' . pathinfo($path, PATHINFO_EXTENSION);
        $absolute = public_path($relative);
        if (! is_dir(dirname($absolute))) {
            mkdir(dirname($absolute), 0775, true);
        }
        copy(public_path($path), $absolute);

        return $relative;
    }

    private static function fail(string $message = 'Format gambar tidak valid.'): never
    {
        throw ValidationException::withMessages(['image' => $message]);
    }
}

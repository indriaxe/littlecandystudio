<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $primaryKey = 'key';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = ['key', 'value'];

    /** Pengaturan yang berupa teks (sisanya angka). */
    public const TEXT_KEYS = ['wa', 'qris', 'qrisNama', 'jam'];

    /** Semua pengaturan: nilai dari database, atau nilai awal di config/littlecandy.php. */
    public static function values(): array
    {
        $stored = static::query()->pluck('value', 'key')->all();
        $out = [];
        foreach (config('littlecandy.defaults') as $key => $default) {
            $value = array_key_exists($key, $stored) ? $stored[$key] : $default;
            $out[$key] = in_array($key, self::TEXT_KEYS, true) ? (string) $value : (int) $value;
        }
        return $out;
    }

    public static function put(string $key, $value): void
    {
        static::query()->updateOrCreate(['key' => $key], ['value' => (string) $value]);
    }
}

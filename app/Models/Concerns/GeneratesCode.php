<?php

namespace App\Models\Concerns;

/**
 * Membuat kode otomatis dari id: LCS001, CQ001, IS001, ...
 * Model yang memakai trait ini wajib punya konstanta CODE_PREFIX
 * dan kolom `code` (nullable, unique).
 */
trait GeneratesCode
{
    protected static function bootGeneratesCode(): void
    {
        static::created(function ($model) {
            $model->forceFill([
                'code' => static::CODE_PREFIX . str_pad((string) $model->id, 3, '0', STR_PAD_LEFT),
            ])->saveQuietly();
        });
    }

    /** Tanggal pembuatan dalam format "22 Nov 2026" (dipakai di tampilan). */
    public function dateLabel(): string
    {
        return $this->created_at->copy()->locale('id')->translatedFormat('j M Y');
    }
}

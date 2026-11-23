<?php

namespace App\Models;

use App\Models\Concerns\GeneratesCode;
use Illuminate\Database\Eloquent\Model;

class Complaint extends Model
{
    use GeneratesCode;

    public const CODE_PREFIX = 'IS';

    protected $fillable = ['nama', 'kontak', 'jenis', 'text', 'status', 'reply', 'show_faq'];

    protected $casts = ['show_faq' => 'boolean'];

    public function toFront(): array
    {
        return [
            'code'   => $this->code,
            'nama'   => $this->nama,
            'kontak' => $this->kontak,
            'jenis'  => (string) $this->jenis,
            'text'   => $this->text,
            'date'   => $this->dateLabel(),
            'status' => $this->status,
            'reply'  => (string) $this->reply,
            'faq'    => $this->show_faq,
        ];
    }

    public function toPublic(): array
    {
        return [
            'code'   => $this->code,
            'date'   => $this->dateLabel(),
            'status' => $this->status,
            'reply'  => (string) $this->reply,
        ];
    }
}

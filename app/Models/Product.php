<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Product extends Model
{
    protected $fillable = [
        'name', 'category_id', 'price', 'image', 'description',
        'is_active', 'sold_out', 'is_featured',
    ];

    protected $casts = [
        'price'       => 'integer',
        'is_active'   => 'boolean',
        'sold_out'    => 'boolean',
        'is_featured' => 'boolean',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /** Bentuk data yang dibaca oleh JavaScript di browser. */
    public function toFront(): array
    {
        return [
            'id'  => $this->id,
            'n'   => $this->name,
            'k'   => $this->category->name,
            'pr'  => $this->price,
            'img' => $this->image,
            'd'   => (string) $this->description,
            'on'  => $this->is_active,
            'so'  => $this->sold_out,
            'bs'  => $this->is_featured,
        ];
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Ramsey\Uuid\Uuid;

#[Fillable(['id', 'user_id', 'data'])]
class Cv extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;

    /** @use HasFactory<\Database\Factories\CvFactory> */
    use HasFactory;

    protected static function booted(): void
    {
        static::creating(function (Cv $cv) {
            $cv->id ??= Uuid::uuid7()->toString();
        });
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'data' => 'array',
        ];
    }
}

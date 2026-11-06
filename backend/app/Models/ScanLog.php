<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ScanLog extends Model
{
    protected $fillable = [
        'user_id',
        'coco_class',
        'confidence',
        'matched',
        'waste_item_id',
        'method',
    ];

    protected function casts(): array
    {
        return [
            'matched'    => 'boolean',
            'confidence' => 'float',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function wasteItem(): BelongsTo
    {
        return $this->belongsTo(WasteItem::class);
    }
}

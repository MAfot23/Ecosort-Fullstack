<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WasteItem extends Model
{
    protected $fillable = ['name', 'icon', 'bin', 'tip', 'coco_class'];

    public function scanLogs(): HasMany
    {
        return $this->hasMany(ScanLog::class);
    }
}

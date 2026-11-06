<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WasteItem;

class WasteItemController extends Controller
{
    // Used by the frontend's "tap list" (manual sorting, no camera needed)
    public function index()
    {
        return response()->json(
            WasteItem::orderBy('name')->get(['id', 'name', 'icon', 'bin', 'tip'])
        );
    }
}

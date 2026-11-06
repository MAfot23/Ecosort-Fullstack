<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ScanLog;
use App\Models\WasteItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DetectController extends Controller
{
    /**
     * The camera frame is analyzed client-side with TensorFlow.js (COCO-SSD) —
     * PHP has no practical way to run that image model. What THIS endpoint
     * does is take the raw detected object class (e.g. "banana", "cell phone")
     * and look up the authoritative bin + tip for it from the database, so
     * the bin-matching rules live on the server and can't be spoofed or
     * edited by tampering with frontend code. It also logs the scan.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'coco_class' => ['required', 'string'],
            'confidence' => ['nullable', 'numeric', 'min:0', 'max:1'],
            'method'     => ['nullable', 'in:camera,manual'],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $item   = WasteItem::where('coco_class', $request->coco_class)->first();
        $method = $request->input('method', 'camera');

        // Log every scan attempt
        ScanLog::create([
            'user_id'      => $request->user()?->id,
            'coco_class'   => $request->coco_class,
            'confidence'   => $request->confidence,
            'matched'      => (bool) $item,
            'waste_item_id'=> $item?->id,
            'method'       => $method,
        ]);

        if (! $item) {
            return response()->json([
                'matched'        => false,
                'detected_class' => $request->coco_class,
                'scan_count'     => ScanLog::count(),
                'message'        => 'Detected "'.$request->coco_class.'" — not in the waste guide, use your judgement or the tap list.',
            ]);
        }

        return response()->json([
            'matched'        => true,
            'detected_class' => $request->coco_class,
            'confidence'     => $request->confidence,
            'item'           => $item,
            'scan_count'     => ScanLog::count(),
        ]);
    }

    /**
     * Log a manual tap-list selection (no camera).
     */
    public function manual(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'waste_item_id' => ['required', 'integer', 'exists:waste_items,id'],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $item = WasteItem::findOrFail($request->waste_item_id);

        ScanLog::create([
            'user_id'       => $request->user()?->id,
            'coco_class'    => $item->coco_class ?? 'manual',
            'confidence'    => null,
            'matched'       => true,
            'waste_item_id' => $item->id,
            'method'        => 'manual',
        ]);

        return response()->json([
            'matched'    => true,
            'item'       => $item,
            'scan_count' => ScanLog::count(),
        ]);
    }

    /**
     * Return the global total scan count (public).
     */
    public function count()
    {
        return response()->json([
            'scan_count' => ScanLog::count(),
        ]);
    }
}

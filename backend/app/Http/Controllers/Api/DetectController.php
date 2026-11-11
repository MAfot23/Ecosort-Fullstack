<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ScanLog;
use App\Models\WasteItem;
use Carbon\Carbon;
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
            'coco_class'  => ['required', 'string'],
            'confidence'  => ['nullable', 'numeric', 'min:0', 'max:1'],
            'method'      => ['nullable', 'in:camera,manual'],
            'candidates'  => ['nullable', 'array'],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $method = $request->input('method', 'camera');
        $primaryClass = $request->input('coco_class');
        $candidates = $request->input('candidates', []);

        // 1. Try finding match for the primary detected class
        $item = WasteItem::where('coco_class', $primaryClass)->first();
        $matchedClass = $primaryClass;
        $matchedConfidence = $request->confidence;

        // 2. Multi-Candidate fallback: if primary wasn't in waste guide, check other detected candidates
        if (! $item && ! empty($candidates)) {
            foreach ($candidates as $cand) {
                $candClass = is_array($cand) ? ($cand['class'] ?? '') : (string) $cand;
                $candConf  = is_array($cand) ? ($cand['confidence'] ?? null) : null;

                if (! empty($candClass)) {
                    $candidateItem = WasteItem::where('coco_class', $candClass)->first();
                    if ($candidateItem) {
                        $item = $candidateItem;
                        $matchedClass = $candClass;
                        $matchedConfidence = $candConf ?? $matchedConfidence;
                        break;
                    }
                }
            }
        }

        // Log the scan attempt
        ScanLog::create([
            'user_id'       => $request->user()?->id,
            'coco_class'    => $matchedClass,
            'confidence'    => $matchedConfidence,
            'matched'       => (bool) $item,
            'waste_item_id' => $item?->id,
            'method'        => $method,
        ]);

        if (! $item) {
            return response()->json([
                'matched'        => false,
                'detected_class' => $primaryClass,
                'scan_count'     => ScanLog::count(),
                'message'        => 'Detected "'.$primaryClass.'" — not in the waste guide, use your judgement or the tap list.',
            ]);
        }

        return response()->json([
            'matched'        => true,
            'detected_class' => $matchedClass,
            'confidence'     => $matchedConfidence,
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

    /**
     * Return weekly disposal statistics (ilang beses nagtapon per week & daily).
     */
    public function weeklyStats(Request $request)
    {
        $now = Carbon::now();
        $startOfWeek     = $now->copy()->startOfWeek(); // Monday 00:00:00
        $endOfWeek       = $now->copy()->endOfWeek();   // Sunday 23:59:59
        $startOfLastWeek = $now->copy()->subWeek()->startOfWeek();
        $endOfLastWeek   = $now->copy()->subWeek()->endOfWeek();

        // Total scans this week vs last week
        $thisWeekCount = ScanLog::whereBetween('created_at', [$startOfWeek, $endOfWeek])->count();
        $lastWeekCount = ScanLog::whereBetween('created_at', [$startOfLastWeek, $endOfLastWeek])->count();

        // Scans this week categorized by bin
        $byBinThisWeek = ScanLog::join('waste_items', 'scan_logs.waste_item_id', '=', 'waste_items.id')
            ->whereBetween('scan_logs.created_at', [$startOfWeek, $endOfWeek])
            ->selectRaw('waste_items.bin, COUNT(*) as count')
            ->groupBy('waste_items.bin')
            ->pluck('count', 'waste_items.bin')
            ->toArray();

        // 7-day daily breakdown for current week (Mon-Sun)
        $daily = [];
        for ($i = 0; $i < 7; $i++) {
            $dayStart = $startOfWeek->copy()->addDays($i)->startOfDay();
            $dayEnd   = $startOfWeek->copy()->addDays($i)->endOfDay();

            $dayCount = ScanLog::whereBetween('created_at', [$dayStart, $dayEnd])->count();

            $daily[] = [
                'day'      => $dayStart->format('D'),
                'date'     => $dayStart->format('M j'),
                'count'    => $dayCount,
                'is_today' => $dayStart->isToday(),
            ];
        }

        // Past 4 weeks summary
        $weeklyHistory = [];
        for ($w = 0; $w < 4; $w++) {
            $wStart = $now->copy()->subWeeks($w)->startOfWeek();
            $wEnd   = $wStart->copy()->endOfWeek();
            $wCount = ScanLog::whereBetween('created_at', [$wStart, $wEnd])->count();

            $label = match ($w) {
                0 => 'This Week',
                1 => 'Last Week',
                default => $wStart->format('M j') . ' - ' . $wEnd->format('M j'),
            };

            $weeklyHistory[] = [
                'label'       => $label,
                'week_number' => $wStart->weekOfYear,
                'count'       => $wCount,
            ];
        }

        // If authenticated, get logged-in user's personal weekly disposal count
        $userThisWeek = null;
        if ($request->user()) {
            $userThisWeek = ScanLog::where('user_id', $request->user()->id)
                ->whereBetween('created_at', [$startOfWeek, $endOfWeek])
                ->count();
        }

        return response()->json([
            'this_week_total'      => $thisWeekCount,
            'last_week_total'      => $lastWeekCount,
            'user_this_week_total' => $userThisWeek,
            'by_bin_this_week'     => [
                'organic'    => $byBinThisWeek['organic'] ?? 0,
                'recyclable' => $byBinThisWeek['recyclable'] ?? 0,
                'residual'   => $byBinThisWeek['residual'] ?? 0,
            ],
            'daily'                => $daily,
            'weekly_history'       => $weeklyHistory,
        ]);
    }
}

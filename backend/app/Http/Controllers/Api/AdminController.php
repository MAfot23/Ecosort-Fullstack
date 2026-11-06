<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GameScore;
use App\Models\QuizScore;
use App\Models\ScanLog;
use App\Models\User;
use App\Models\WasteItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * Admin-only endpoints.
 * All routes here are protected by auth:sanctum + the admin middleware.
 */
class AdminController extends Controller
{
    // ── Dashboard stats ──────────────────────────────────────────────────────

    public function stats()
    {
        return response()->json([
            'total_scans'     => ScanLog::count(),
            'camera_scans'    => ScanLog::where('method', 'camera')->count(),
            'manual_scans'    => ScanLog::where('method', 'manual')->count(),
            'matched_scans'   => ScanLog::where('matched', true)->count(),
            'unmatched_scans' => ScanLog::where('matched', false)->count(),
            'total_users'     => User::count(),
            'admin_users'     => User::where('is_admin', true)->count(),
            'total_items'     => WasteItem::count(),
            'scans_by_bin'    => ScanLog::join('waste_items', 'scan_logs.waste_item_id', '=', 'waste_items.id')
                ->selectRaw('waste_items.bin, COUNT(*) as count')
                ->groupBy('waste_items.bin')
                ->pluck('count', 'waste_items.bin'),
        ]);
    }

    // ── Scan logs ─────────────────────────────────────────────────────────────

    public function scanLogs(Request $request)
    {
        $logs = ScanLog::with(['user:id,name,email', 'wasteItem:id,name,icon,bin'])
            ->latest()
            ->paginate($request->input('per_page', 25));

        return response()->json($logs);
    }

    // ── Users ─────────────────────────────────────────────────────────────────

    public function users()
    {
        $users = User::withCount([
            'scanLogs',
        ])->latest()->get(['id', 'name', 'email', 'is_admin', 'created_at']);

        return response()->json($users);
    }

    public function toggleAdmin(Request $request, User $user)
    {
        // Prevent self-demotion
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Cannot change your own admin status.'], 403);
        }

        $user->update(['is_admin' => ! $user->is_admin]);

        return response()->json(['user' => $user]);
    }

    // ── Waste items CRUD ──────────────────────────────────────────────────────

    public function wasteItems()
    {
        return response()->json(WasteItem::withCount('scanLogs')->orderBy('bin')->orderBy('name')->get());
    }

    public function storeWasteItem(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'       => ['required', 'string', 'max:120'],
            'icon'       => ['required', 'string', 'max:10'],
            'bin'        => ['required', 'in:organic,recyclable,residual'],
            'tip'        => ['required', 'string'],
            'coco_class' => ['nullable', 'string', 'unique:waste_items,coco_class'],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $item = WasteItem::create($request->only('name', 'icon', 'bin', 'tip', 'coco_class'));

        return response()->json($item, 201);
    }

    public function updateWasteItem(Request $request, WasteItem $wasteItem)
    {
        $validator = Validator::make($request->all(), [
            'name'       => ['sometimes', 'required', 'string', 'max:120'],
            'icon'       => ['sometimes', 'required', 'string', 'max:10'],
            'bin'        => ['sometimes', 'required', 'in:organic,recyclable,residual'],
            'tip'        => ['sometimes', 'required', 'string'],
            'coco_class' => ['nullable', 'string', 'unique:waste_items,coco_class,'.$wasteItem->id],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $wasteItem->update($request->only('name', 'icon', 'bin', 'tip', 'coco_class'));

        return response()->json($wasteItem);
    }

    public function destroyWasteItem(WasteItem $wasteItem)
    {
        $wasteItem->delete();

        return response()->json(['message' => 'Deleted.']);
    }
}

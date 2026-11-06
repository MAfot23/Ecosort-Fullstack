<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GameScore;
use App\Models\QuizScore;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ScoreController extends Controller
{
    public function storeGame(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'score' => ['required', 'integer', 'min:0'],
            'total_rounds' => ['required', 'integer', 'min:1'],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $record = GameScore::create([
            'user_id' => $request->user()->id,
            'score' => $request->score,
            'total_rounds' => $request->total_rounds,
        ]);

        $best = GameScore::where('user_id', $request->user()->id)->max('score');

        return response()->json(['score' => $record, 'best' => $best], 201);
    }

    public function storeQuiz(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'score' => ['required', 'integer', 'min:0'],
            'total_questions' => ['required', 'integer', 'min:1'],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $record = QuizScore::create([
            'user_id' => $request->user()->id,
            'score' => $request->score,
            'total_questions' => $request->total_questions,
        ]);

        $best = QuizScore::where('user_id', $request->user()->id)->max('score');

        return response()->json(['score' => $record, 'best' => $best], 201);
    }

    public function best(Request $request)
    {
        $userId = $request->user()->id;

        return response()->json([
            'best_game_score' => GameScore::where('user_id', $userId)->max('score'),
            'best_quiz_score' => QuizScore::where('user_id', $userId)->max('score'),
        ]);
    }
}

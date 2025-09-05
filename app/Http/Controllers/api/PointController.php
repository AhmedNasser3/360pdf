<?php

namespace App\Http\Controllers\api;

use App\Models\User;
use App\Models\Point;
use App\Models\api\Points;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class PointController extends Controller
{
    // جلب رصيد نقاط مستخدم
    public function getPoints($userId)
    {
        $points = Points::where('user_id', $userId)->first();
        return response()->json($points);
    }

    // زيادة الرصيد
    public function addPoints(Request $request, $userId)
    {
        $request->validate([
            'amount' => 'required|integer|min:1',
        ]);

        $points = Points::firstOrCreate(['user_id' => $userId], ['balance' => 10]);
        $points->balance += $request->amount;
        $points->save();

        return response()->json(['message' => 'تمت إضافة النقاط بنجاح', 'points' => $points]);
    }

    // خصم من الرصيد
    public function subtractPoints(Request $request, $userId)
    {
        $request->validate([
            'amount' => 'required|integer|min:1',
        ]);

        $points = Points::firstOrCreate(['user_id' => $userId], ['balance' => 10]);

        if ($points->balance < $request->amount) {
            return response()->json(['message' => 'رصيد النقاط غير كافٍ'], 400);
        }

        $points->balance -= $request->amount;
        $points->save();

        return response()->json(['message' => 'تم خصم النقاط بنجاح', 'points' => $points]);
    }
}
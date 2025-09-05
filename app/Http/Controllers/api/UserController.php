<?php

namespace App\Http\Controllers\api;

use Throwable;
use App\Models\User;
use App\Models\api\Topic;
use App\Models\api\Points;
use Illuminate\Http\Request;
use App\Events\PointsUpdated;
use App\Services\UserService;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Database\QueryException;
use App\Http\Resources\api\UserResource;
use App\Http\Requests\api\RegisterUserRequest;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    public function __construct(protected UserService $service) {}

public function allUsers()
{
    // جلب جميع المستخدمين
    $users = User::all();

    // دمج النقاط لكل مستخدم
    $usersWithPoints = $users->map(function($user) {
        $points = Points::where('user_id', $user->id)->first();
        return [
            'id'         => $user->id,
            'name'       => $user->name,
            'email'      => $user->email,
            'role'       => $user->role,
            'status'     => $user->status,
            'points'     => $points?->balance ?? 0,
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at,
        ];
    });

    return response()->json($usersWithPoints);
}

public function register(RegisterUserRequest $request)
{
    try {
        $user = $this->service->register($request->toDTO());
        $token = $user->createToken('auth_token')->plainTextToken;

        // إنشاء نقاط للمستخدم الجديد
        $points = Points::create([
            'user_id' => $user->id,
            'balance' => 10
        ]);

        // إرسال الحدث لتحديث النقاط Live
        event(new PointsUpdated($user->id, $points->balance));

        return response()->json([
            'message' => 'Registration successful',
            'token' => $token,
            'user' => new UserResource($user),
        ], 201);
    } catch (ValidationException $e) {
        return response()->json(['message' => 'Validation error', 'errors' => $e->errors()], 422);
    } catch (QueryException $e) {
        return response()->json(['message' => 'Database error', 'error' => $e->getMessage()], 500);
    } catch (Throwable $e) {
        return response()->json(['message' => 'Registration failed', 'error' => $e->getMessage()], 500);
    }
}


    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required']
        ]);

        if (!auth()->attempt($credentials)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $user = auth()->user();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'token' => $token,
            'user' => new UserResource($user),
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logout successful']);
    }

public function show(Request $request)
{
    $user = $request->user();
    $points = Points::where('user_id', $user->id)->first();

    // جلب الـ Topics حسب role
    if ($user->role === 'admin') {
        // جميع المواضيع
        $topics = Topic::latest()->get(['id', 'title', 'file_path', 'download_url', 'created_at']);
    } else {
        // المواضيع الخاصة بالمستخدم
        $topics = Topic::where('user_id', $user->id)
            ->latest()
            ->get(['id', 'title', 'file_path', 'download_url', 'created_at']);
    }

    return response()->json([
        'id'      => $user->id,
        'name'    => $user->name,
        'email'   => $user->email,
        'status'  => $user->status,
        'role'       => $user->role,
        'points'  => $points?->balance ?? 0,
        'topics'  => $topics,
    ]);
}



public function update(Request $request, $id)
{
    $data = $request->validate([
        'name'   => ['nullable', 'string', 'max:255'],
        'email'  => ['nullable', 'email', 'max:255', 'unique:users,email,' . $id],
        'role'   => ['nullable', 'string', 'max:50'],
        'status' => ['nullable', 'string', 'max:50'],
        'points' => ['nullable', 'integer'],
    ]);

    $user = \App\Models\User::findOrFail($id);

    // تحديث بيانات المستخدم
    $user->update(array_filter($data, fn ($value) => !is_null($value)));

    // تحديث النقاط إذا تم إرسالها
    if ($request->has('points')) {
        Points::updateOrCreate(
            ['user_id' => $user->id],
            ['balance' => $request->points]
        );
    }

    return response()->json([
        'id'     => $user->id,
        'name'   => $user->name,
        'email'  => $user->email,
        'role'   => $user->role,
        'status' => $user->status,
        'points' => Points::where('user_id', $user->id)->first()?->balance ?? 0,
    ]);
}



public function destroy($id)
{
    $user = User::find($id);

    if (!$user) {
        return response()->json(['message' => 'User not found'], 404);
    }

    $user->delete(); // حذف نهائي
    return response()->json(['message' => 'User deleted successfully']);
}

}
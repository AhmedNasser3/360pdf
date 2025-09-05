<?php

use App\Models\User;
use App\Models\api\Points;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\api\OcrController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\TopicController;
use App\Http\Controllers\api\PayPalController;
use App\Http\Controllers\api\ArchiveController;
use App\Http\Controllers\Api\OptimizeController;
use App\Http\Controllers\Api\PdfMergeController;
use App\Http\Controllers\Api\PdfSplitController;
use App\Http\Controllers\Api\WatermarkController;
use App\Http\Controllers\Api\PdfConvertController;

Route::middleware('auth:sanctum')->get('/users/all', [UserController::class, 'allUsers']);
/*
|--------------------------------------------------------------------------
| PDF Operations Routes
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/pdf/merge', [PdfMergeController::class, 'merge']);
    Route::post('/pdf/convert', [PdfConvertController::class, 'convert']);
    Route::post('/watermark', [WatermarkController::class, 'addWatermark']);
    Route::post('/optimize-pdf', [OptimizeController::class, 'optimizePdf']);
    Route::post('/split-pdf', [PdfSplitController::class, 'split']);
    Route::post('/ocr-pdf', [OcrController::class, 'ocrPdf']);
    Route::post('/create-archive', [ArchiveController::class, 'createArchive']);

});

/*
|--------------------------------------------------------------------------
| User Routes
|--------------------------------------------------------------------------
*/
Route::prefix('users')->group(function () {
    Route::post('/register', [UserController::class, 'register']);
    Route::post('/login', [UserController::class, 'login'])->name('login');
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [UserController::class, 'logout']);
        Route::put('/{id}', [UserController::class, 'update']);
        Route::get('/{id}', [UserController::class, 'show']);
        Route::delete('/{id}', [UserController::class, 'destroy']);
        Route::delete('/{id}/force', [UserController::class, 'forceDestroy']);
    });
});

// Current user routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/users/me', [UserController::class, 'show']);
    Route::put('/users/me', [UserController::class, 'update']);
    Route::delete('/users/me', [UserController::class, 'destroy']);

});

/*
|--------------------------------------------------------------------------
| Auth Check Route
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->get('/check-auth', function (Request $request) {
    return response()->json(['authenticated' => true, 'user' => $request->user()]);
});
Route::post('/paypal/create-order', [PayPalController::class, 'createOrder']);
Route::get('/paypal-success', [PayPalController::class, 'success'])->name('paypal.success');
Route::get('/paypal-cancel', [PayPalController::class, 'cancel'])->name('paypal.cancel');
// routes/api.php
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\api\UserController;
use App\Http\Controllers\api\PointController;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/{any}', function () {
    return view('app'); // لو بتسميها app.blade.php
})->where('any', '.*');

Route::get('/points/{userId}', [PointController::class, 'getPoints']);
Route::post('/points/add/{userId}', [PointController::class, 'addPoints']);
Route::post('/points/subtract/{userId}', [PointController::class, 'subtractPoints']);
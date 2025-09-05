<?php

namespace App\Http\Controllers\api;

use App\Models\User;
use App\Models\api\Points;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class PayPalController extends Controller
{
    private $clientId = "Af-83J-n2OduBzZuDd4TOfgtjXud-DbKHtzGMavRk6naUVd-g2R9Zj31RpspIyMgiKi7hDOTZUYLGkxF";
    private $clientSecret = "EHyqDaGURxsOO3G1zktGPyTYZwt5-gwyMSEjNek73S1j0tHQp7-XDPpFALI9BoM-HwydpVuZMHDnk5Q2";
    private $baseUrl = "https://api-m.sandbox.paypal.com";

    // إنشاء طلب دفع
public function createOrder(Request $request)
{
    $amount = $request->amount ?? "10.00";
    $userId = $request->input('user_id');
    $pointsToAdd = $request->input('points') ?? 10; // النقاط المختارة من الفرونت
    $accessToken = $this->getAccessToken();

    $response = Http::withToken($accessToken)->post($this->baseUrl . '/v2/checkout/orders', [
        "intent" => "CAPTURE",
        "application_context" => [
            "return_url" => route('paypal.success'),
            "cancel_url" => route('paypal.cancel')
        ],
        "purchase_units" => [
            [
                "amount" => [
                    "currency_code" => "USD",
                    "value" => $amount
                ]
            ]
        ]
    ]);

    $orderData = $response->json();
    Log::info('PayPal Create Order Response:', $orderData);

    // حفظ user_id والنقاط مؤقتًا مع order_id لمدة 30 دقيقة
    if (isset($orderData['id'])) {
        Cache::put('paypal_order_user_' . $orderData['id'], [
            'user_id' => $userId,
            'points' => $pointsToAdd
        ], now()->addMinutes(30));
        Log::info('User ID and Points Cached:', [
            'key' => 'paypal_order_user_' . $orderData['id'],
            'data' => ['user_id' => $userId, 'points' => $pointsToAdd]
        ]);
    }

    return response()->json($orderData);
}

public function success(Request $request)
{
    $orderId = $request->get('token');

    if (!$orderId) {
        return redirect('/')->with('error', 'لم يتم العثور على رقم الطلب');
    }

    $accessToken = $this->getAccessToken();
    $response = Http::withToken($accessToken)
        ->withHeaders(['Content-Type' => 'application/json'])
        ->post($this->baseUrl . "/v2/checkout/orders/{$orderId}/capture", (object)[]);

    $result = $response->json();
    Log::info('PayPal Capture Response:', $result);

    if (isset($result['status']) && $result['status'] === 'COMPLETED') {
        // استرجاع البيانات المخزنة مؤقتًا
        $cachedData = Cache::get('paypal_order_user_' . $orderId);
        Log::info('Cached Data Retrieved:', ['data' => $cachedData]);

        if (is_array($cachedData) && isset($cachedData['user_id'], $cachedData['points'])) {
            $userId = $cachedData['user_id'];
            $pointsToAdd = $cachedData['points']; // النقاط المختارة من الفرونت

            $points = Points::firstOrCreate(
                ['user_id' => $userId],
                ['balance' => 0]
            );
            $points->balance += $pointsToAdd; // الآن النقاط ديناميكية
            $points->save();

            return redirect('/account')->with('success', "تم الدفع! تم إضافة {$pointsToAdd} نقاط إلى حسابك.");
        } else {
            Log::error('Cached data is invalid', ['data' => $cachedData]);
            return redirect('/')->with('error', 'فشل استرجاع بيانات النقاط بعد الدفع.');
        }
    }

    return redirect('/')->with('error', 'فشلت عملية الدفع');
}




    // عند الإلغاء
    public function cancel()
    {
        return redirect('/')->with('error', 'تم إلغاء الدفع');
    }

    // جلب Access Token
    private function getAccessToken()
    {
        $response = Http::withBasicAuth($this->clientId, $this->clientSecret)
            ->asForm()
            ->post($this->baseUrl . '/v1/oauth2/token', [
                'grant_type' => 'client_credentials'
            ]);

        Log::info('PayPal Access Token Response:', $response->json());

        return $response->json()['access_token'];
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Models\api\Topic;
use App\Models\api\Points;
use CloudConvert\Models\Job;
use Illuminate\Http\Request;
use CloudConvert\Models\Task;
use CloudConvert\CloudConvert;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;

class OptimizeController extends Controller
{
    public function optimizePdf(Request $request)
    {
        try {
            // التحقق من المدخلات
            $request->validate([
                'pdf' => 'required|file|mimes:pdf',
            ]);

            Log::info('✅ بدء عملية Optimize PDF...');

            // التحقق من رصيد النقاط
            $user = $request->user();
            $points = Points::where('user_id', $user->id)->first();

            if (!$points || $points->balance < 1) {
                return response()->json([
                'error' => 'You have 0 points. Please recharge your balance.'
                ], 403);
            }

            // تهيئة CloudConvert
            $cloudconvert = new CloudConvert([
                'api_key' => 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiMTdkYTc5NWUzNTI0NmNmZDcxMzE1NWIwYmI4MjJlYjcxY2MyMWUwZTg0Mzk2YTMwNmFiZmJlNTlkMTY5MjE5NDUyMTczZDg4ZDc4YWU2YzUiLCJpYXQiOjE3NTUwMjA5MDMuOTYzMjY2LCJuYmYiOjE3NTUwMjA5MDMuOTYzMjY3LCJleHAiOjQ5MTA2OTQ1MDMuOTU5NjI3LCJzdWIiOiI3MjU4Mzk0OCIsInNjb3BlcyI6WyJ1c2VyLnJlYWQiLCJ1c2VyLndyaXRlIiwidGFzay5yZWFkIiwidGFzay53cml0ZSIsIndlYmhvb2sucmVhZCIsIndlYmhvb2sud3JpdGUiLCJwcmVzZXQucmVhZCIsInByZXNldC53cml0ZSJdfQ.IHIkJ-u_KKv18ZZXA1zYylGi8c1JWKeeNkzEAvVH_WL_V2D1P2_IX4DCU0NvgdlNJJb7FbS-WKKkt83YzUTK_lyhUt2qkhSl6YBpnKqIwB9AofpRetobuuqLRMNEC8mWahiBHukxKI5YlJEmbVoqPav9TeKlzQSSNRTqyNU2shkHdaueiGOOoij2q5qb2cM7EeAxjpi3oaUGJZs3zVRqSZBXyd2ENHYYHko5wm7fcnmKKD5l2VTCQ8fUmQIX0P_5oADFvxa8234bwp9olOHnP1lzZBh1TOBfxZhQ1yLZNoB-D-VBTKWcFBejUcwufy2Vi_FZLgG_iIiJenBnV12lvFiFds50yAKSfzwVkoNLMUXtHJTUlsYO3Wdv9_RTcKJ3of7fEUGTCrSanhvSY5FWTiuR4R2eIyWAbSZHlP_vtz071c_ccd2nJBRPDJfkAwMYn_qklPXkw2rm_asl6KRo_xJkhAWo4FDZTcq-45jhvZAmxz9ej57-AxxXeV0fm_exbmfhXCyvfpHUADYyXHc9zDMQNTLXXUhS2siIhKrUbExdpiWJt_uTmjtRw4B-J_6kdKsXXd8k3bDYYRWEvsvOlny2t6dCCyIckZv1hrJvqV_YWPX2MQdJPH7a2rGC3bRPAB7FuXDLggIP2Wy76YJCOyg4VuyW1j8bPfwu13q2gDE',
                'sandbox' => false,
            ]);

            $job = new Job();

            // استيراد الملف
            $job->addTask(new Task('import/upload', 'import-1'));

            // عملية Optimize
            $optimizeTask = (new Task('optimize', 'task-1'))
                ->set('input', ['import-1'])
                ->set('input_format', 'pdf')
                ->set('engine', 'pdftools')
                ->set('profile', 'web')
                ->set('flatten_signatures', false)
                ->set('engine_version', '1.9.0')
                ->set('filename', 'cv.pdf')
                ->set('timeout', 10);

            $job->addTask($optimizeTask);

            // تصدير الملف
            $exportTask = (new Task('export/url', 'export-task'))
                ->set('input', 'task-1');
            $job->addTask($exportTask);

            // إنشاء Job
            $job = $cloudconvert->jobs()->create($job);

            // رفع الملف
            $uploadedFile = $request->file('pdf');
            $uploadTask = $job->getTasks()->whereName('import-1')[0];

            $inputStream = fopen($uploadedFile->getRealPath(), 'r');
            $cloudconvert->tasks()->upload($uploadTask, $inputStream);

            if (is_resource($inputStream)) {
                fclose($inputStream);
            }

            Log::info('📤 تم رفع الملف بنجاح');

            // انتظار اكتمال الـ Job
            $job = $cloudconvert->jobs()->wait($job);

            // الحصول على رابط التحميل
            $exportTaskData = $job->getTasks()->whereName('export-task')[0];
            $downloadUrl = $exportTaskData->getResult()->files[0]->url ?? null;

            // تحميل الملف وحفظه محلياً
            if ($downloadUrl) {
                $optimizedFile = file_get_contents($downloadUrl);
                $localPath = 'optimized/' . uniqid() . '_optimized.pdf';
                Storage::disk('public')->put($localPath, $optimizedFile);

                // خصم نقطة واحدة من المستخدم
                $points->decrement('balance', 1);
                    // حفظ العملية في جدول Topic
    Topic::create([
        'user_id' => $user->id,
        'title' => 'Optimize PDF',
        'file_path' => $localPath,
        'download_url' => $downloadUrl,
    ]);
            }

            return response()->json([
                'message' => '✅ تم تحسين (Optimize) الملف بنجاح',
                'download_url' => $downloadUrl,
                'local_path' => asset('storage/' . $localPath),
            ]);
        } catch (\Exception $e) {
            Log::error('❌ خطأ أثناء Optimize PDF', ['error' => $e->getMessage()]);
            return response()->json([
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}

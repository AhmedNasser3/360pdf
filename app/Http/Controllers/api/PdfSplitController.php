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

class PdfSplitController extends Controller
{
    public function split(Request $request)
    {
        try {
            // ✅ التحقق من الملف
            $request->validate([
                'pdf' => 'required|file|mimes:pdf|max:10240',
            ]);

            Log::info('✅ بدء عملية الـ Split...');
  // التحقق من رصيد النقاط
            $user = $request->user();
            $points = Points::where('user_id', $user->id)->first();

            if (!$points || $points->balance < 1) {
                return response()->json([
                'error' => 'You have 0 points. Please recharge your balance.'
                ], 403);
            }
            $cloudconvert = new CloudConvert([
                'api_key' => 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiMTdkYTc5NWUzNTI0NmNmZDcxMzE1NWIwYmI4MjJlYjcxY2MyMWUwZTg0Mzk2YTMwNmFiZmJlNTlkMTY5MjE5NDUyMTczZDg4ZDc4YWU2YzUiLCJpYXQiOjE3NTUwMjA5MDMuOTYzMjY2LCJuYmYiOjE3NTUwMjA5MDMuOTYzMjY3LCJleHAiOjQ5MTA2OTQ1MDMuOTU5NjI3LCJzdWIiOiI3MjU4Mzk0OCIsInNjb3BlcyI6WyJ1c2VyLnJlYWQiLCJ1c2VyLndyaXRlIiwidGFzay5yZWFkIiwidGFzay53cml0ZSIsIndlYmhvb2sucmVhZCIsIndlYmhvb2sud3JpdGUiLCJwcmVzZXQucmVhZCIsInByZXNldC53cml0ZSJdfQ.IHIkJ-u_KKv18ZZXA1zYylGi8c1JWKeeNkzEAvVH_WL_V2D1P2_IX4DCU0NvgdlNJJb7FbS-WKKkt83YzUTK_lyhUt2qkhSl6YBpnKqIwB9AofpRetobuuqLRMNEC8mWahiBHukxKI5YlJEmbVoqPav9TeKlzQSSNRTqyNU2shkHdaueiGOOoij2q5qb2cM7EeAxjpi3oaUGJZs3zVRqSZBXyd2ENHYYHko5wm7fcnmKKD5l2VTCQ8fUmQIX0P_5oADFvxa8234bwp9olOHnP1lzZBh1TOBfxZhQ1yLZNoB-D-VBTKWcFBejUcwufy2Vi_FZLgG_iIiJenBnV12lvFiFds50yAKSfzwVkoNLMUXtHJTUlsYO3Wdv9_RTcKJ3of7fEUGTCrSanhvSY5FWTiuR4R2eIyWAbSZHlP_vtz071c_ccd2nJBRPDJfkAwMYn_qklPXkw2rm_asl6KRo_xJkhAWo4FDZTcq-45jhvZAmxz9ej57-AxxXeV0fm_exbmfhXCyvfpHUADYyXHc9zDMQNTLXXUhS2siIhKrUbExdpiWJt_uTmjtRw4B-J_6kdKsXXd8k3bDYYRWEvsvOlny2t6dCCyIckZv1hrJvqV_YWPX2MQdJPH7a2rGC3bRPAB7FuXDLggIP2Wy76YJCOyg4VuyW1j8bPfwu13q2gDE',
                'sandbox' => false
            ]);

            $job = new Job();

            // حفظ الملف داخل storage
            $file = $request->file('pdf');
            $savedPath = $file->store('uploads', 'public');

            // استيراد الملف
            $job->addTask(new Task('import/upload', 'import-1'));

            // إعداد مهمة الـ Split
            $splitTask = (new Task('pdf/split-pages', 'task-1'))
                ->set('engine', 'qpdf')
                ->set('engine_version', '11.2.0')
                ->set('filename', 'splitted.pdf')
                ->set('input', ['import-1']);
            $job->addTask($splitTask);

            // مهمة تصدير الرابط
            $exportTask = (new Task('export/url', 'export-splitted'))
                ->set('input', 'task-1');
            $job->addTask($exportTask);

            // إنشاء الـ Job
            $job = $cloudconvert->jobs()->create($job);
            Log::info('📌 Job تم إنشاؤه', ['job_id' => $job->getId()]);

            // رفع الملف من storage
            $fullPath = storage_path('app/public/' . $savedPath);
            if (!file_exists($fullPath)) {
                throw new \Exception("❌ الملف غير موجود في المسار: $fullPath");
            }

            $uploadTask = $job->getTasks()->whereName('import-1')[0];
            $inputStream = @fopen($fullPath, 'rb');

            if (is_resource($inputStream)) {
                try {
                    $cloudconvert->tasks()->upload($uploadTask, $inputStream);
                } finally {
$inputStream = fopen($fullPath, 'rb');
if ($inputStream === false) {
    throw new \Exception("فشل في فتح الملف: $fullPath");
}

try {
    $cloudconvert->tasks()->upload($uploadTask, $inputStream);
} finally {
    if (is_resource($inputStream)) {
        fclose($inputStream); // ✅ فقط إذا كان صالح
    }
}
                }
            } else {
                throw new \Exception("❌ فشل في فتح الملف: $fullPath");
            }

            Log::info("📤 تم رفع الملف: " . $file->getClientOriginalName());

            // انتظار اكتمال الـ Job
            $job = $cloudconvert->jobs()->wait($job);

            // استخراج روابط الملفات الناتجة
            $exportTaskData = $job->getTasks()->whereName('export-splitted')[0];
            $files = $exportTaskData->getResult()->files ?? [];
            $downloadUrls = array_map(fn($f) => $f->url, $files);
           if ($downloadUrls) {
                $optimizedFile = file_get_contents($downloadUrls);
                $localPath = 'splitted/' . uniqid() . 'splitted.pdf';
                Storage::disk('public')->put($localPath, $optimizedFile);

                // خصم نقطة واحدة من المستخدم
                    // حفظ العملية في جدول Topic
    Topic::create([
        'user_id' => $user->id,
        'title' => 'Splitted PDF',
        'file_path' => $localPath,
        'download_url' => $downloadUrls,
    ]);
            }
            return response()->json([
                'message' => 'تم تقسيم الملف بنجاح 🎉',
                'download_urls' => $downloadUrls,
                $points->decrement('balance', 1)
            ]);

        } catch (\Exception $e) {
            Log::error('❌ خطأ أثناء عملية الـ Split', ['error' => $e->getMessage()]);
            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
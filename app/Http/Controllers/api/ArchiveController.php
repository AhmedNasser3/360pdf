<?php

namespace App\Http\Controllers\api;

use App\Models\api\Topic;
use App\Models\api\Points;
use CloudConvert\Models\Job;
use CloudConvert\Models\Task;
use CloudConvert\CloudConvert;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;

class ArchiveController extends Controller
{
    public function createArchive(Request $request)
    {
        try {
            // التحقق من المدخلات
            $request->validate([
                'files.*' => 'required|file|mimes:pdf',
            ]);

            Log::info('📦 بدء عملية إنشاء أرشيف...');

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

            // استيراد الملفات
            foreach ($request->file('files') as $index => $file) {
                $taskName = 'import-' . $index;
                $job->addTask(new Task('import/upload', $taskName));
            }

            // مهمة الأرشفة
$archiveTask = (new Task('convert', 'task-1'))
                ->set('input', collect($job->getTasks())->pluck('name')->toArray())
                ->set('output_format', 'zip')
                ->set('engine', 'archivetool')
                ->set('engine_version', '1.1')
                ->set('filename', 'archive.zip')
                ->set('timeout', 120);

            $job->addTask($archiveTask);

            // التصدير
            $exportTask = (new Task('export/url', 'export-task'))
                ->set('input', 'task-1');
            $job->addTask($exportTask);

            // إنشاء Job
            $job = $cloudconvert->jobs()->create($job);

            // رفع الملفات
            foreach ($request->file('files') as $index => $file) {
                $uploadTask = $job->getTasks()->whereName('import-' . $index)[0];
                $inputStream = fopen($file->getRealPath(), 'r');
                $cloudconvert->tasks()->upload($uploadTask, $inputStream);
                if (is_resource($inputStream)) {
                    fclose($inputStream);
                }
            }

            Log::info('📤 تم رفع الملفات بنجاح');

            // انتظار اكتمال Job
            $job = $cloudconvert->jobs()->wait($job);

            // الحصول على رابط التحميل
            $exportTaskData = $job->getTasks()->whereName('export-task')[0];
            $downloadUrl = $exportTaskData->getResult()->files[0]->url ?? null;

            // تحميل الملف وحفظه محلياً
            if ($downloadUrl) {
                $zipFile = file_get_contents($downloadUrl);
                $localPath = 'archives/' . uniqid() . '_archive.zip';
                Storage::disk('public')->put($localPath, $zipFile);

                // خصم نقطة واحدة من المستخدم
                $points->decrement('balance', 1);

                // حفظ العملية في جدول Topic
                Topic::create([
                    'user_id' => $user->id,
                    'title' => 'Archive ZIP',
                    'file_path' => $localPath,
                    'download_url' => $downloadUrl,
                ]);
            }

            return response()->json([
                'message' => '✅ تم إنشاء الأرشيف بنجاح',
                'download_url' => $downloadUrl,
                'local_path' => asset('storage/' . $localPath),
            ]);
        } catch (\Exception $e) {
            Log::error('❌ خطأ أثناء إنشاء الأرشيف', ['error' => $e->getMessage()]);
            return response()->json([
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}

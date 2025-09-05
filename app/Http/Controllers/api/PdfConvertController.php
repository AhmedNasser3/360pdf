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

class PdfConvertController extends Controller
{
    public function convert(Request $request)
    {
        try {
            $request->validate([
                'pdfs' => 'required|array|min:1',
                'pdfs.*' => 'file|max:10240',
                'output_format' => 'required|string',
                'password' => 'nullable|string',
                'pages' => 'nullable|string'
            ]);

            // التحقق من رصيد النقاط
            $user = $request->user();
            $points = Points::where('user_id', $user->id)->first();

            if (!$points || $points->balance < 1) {
                return response()->json([
                    'error' => 'You have 0 points. Please recharge your balance.'
                ], 403);
            }

            $outputFormat = strtolower($request->input('output_format'));
            $password = $request->input('password');
            $pages = $request->input('pages');

            Log::info('✅ بدء عملية التحويل...');

            $cloudconvert = new CloudConvert([
                'api_key' => 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiMTdkYTc5NWUzNTI0NmNmZDcxMzE1NWIwYmI4MjJlYjcxY2MyMWUwZTg0Mzk2YTMwNmFiZmJlNTlkMTY5MjE5NDUyMTczZDg4ZDc4YWU2YzUiLCJpYXQiOjE3NTUwMjA5MDMuOTYzMjY2LCJuYmYiOjE3NTUwMjA5MDMuOTYzMjY3LCJleHAiOjQ5MTA2OTQ1MDMuOTU5NjI3LCJzdWIiOiI3MjU4Mzk0OCIsInNjb3BlcyI6WyJ1c2VyLnJlYWQiLCJ1c2VyLndyaXRlIiwidGFzay5yZWFkIiwidGFzay53cml0ZSIsIndlYmhvb2sucmVhZCIsIndlYmhvb2sud3JpdGUiLCJwcmVzZXQucmVhZCIsInByZXNldC53cml0ZSJdfQ.IHIkJ-u_KKv18ZZXA1zYylGi8c1JWKeeNkzEAvVH_WL_V2D1P2_IX4DCU0NvgdlNJJb7FbS-WKKkt83YzUTK_lyhUt2qkhSl6YBpnKqIwB9AofpRetobuuqLRMNEC8mWahiBHukxKI5YlJEmbVoqPav9TeKlzQSSNRTqyNU2shkHdaueiGOOoij2q5qb2cM7EeAxjpi3oaUGJZs3zVRqSZBXyd2ENHYYHko5wm7fcnmKKD5l2VTCQ8fUmQIX0P_5oADFvxa8234bwp9olOHnP1lzZBh1TOBfxZhQ1yLZNoB-D-VBTKWcFBejUcwufy2Vi_FZLgG_iIiJenBnV12lvFiFds50yAKSfzwVkoNLMUXtHJTUlsYO3Wdv9_RTcKJ3of7fEUGTCrSanhvSY5FWTiuR4R2eIyWAbSZHlP_vtz071c_ccd2nJBRPDJfkAwMYn_qklPXkw2rm_asl6KRo_xJkhAWo4FDZTcq-45jhvZAmxz9ej57-AxxXeV0fm_exbmfhXCyvfpHUADYyXHc9zDMQNTLXXUhS2siIhKrUbExdpiWJt_uTmjtRw4B-J_6kdKsXXd8k3bDYYRWEvsvOlny2t6dCCyIckZv1hrJvqV_YWPX2MQdJPH7a2rGC3bRPAB7FuXDLggIP2Wy76YJCOyg4VuyW1j8bPfwu13q2gDE',
                'sandbox' => false,
            ]);

            $job = new Job();
            $savedFiles = [];
            $inputFormats = [];

            foreach ($request->file('pdfs') as $index => $file) {
                $path = $file->store('uploads', 'public');
                $savedFiles[] = $path;

                $ext = strtolower($file->getClientOriginalExtension());
                $inputFormats[] = $ext;

                $job->addTask(new Task('import/upload', "import{$index}"));
            }

            $inputTaskNames = array_map(fn($i) => "import{$i}", range(0, count($savedFiles) - 1));
            $inputFormat = (count(array_unique($inputFormats)) === 1) ? $inputFormats[0] : 'pdf';

            // --- HTML → PDF ---
            if ($inputFormat === 'html' && $outputFormat === 'pdf') {
                $convertTask = (new Task('convert', 'convert-task'))
                    ->set('input_format', 'html')
                    ->set('output_format', 'pdf')
                    ->set('engine', 'calibre')
                    ->set('input', $inputTaskNames)
                    ->set('zoom', 1)
                    ->set('page_orientation', 'portrait')
                    ->set('print_background', true)
                    ->set('display_header_footer', false)
                    ->set('wait_until', 'load')
                    ->set('wait_time', 0)
                    ->set('engine_version', '7.15')
                    ->set('filename', 'project.pdf')
                    ->set('timeout', 10);

            // --- PPTX → PDF ---
            } elseif ($inputFormat === 'pptx' && $outputFormat === 'pdf') {
                $convertTask = (new Task('convert', 'convert-task'))
                    ->set('input_format', 'pptx')
                    ->set('output_format', 'pdf')
                    ->set('engine', 'libreoffice')
                    ->set('input', $inputTaskNames)
                    ->set('pages', $pages ?? '6')
                    ->set('optimize_print', true)
                    ->set('pdf_a', false)
                    ->set('include_markup', false)
                    ->set('hidden_slides', false)
                    ->set('output_type', 'slides')
                    ->set('slides_per_handout_page', 6)
                    ->set('password', $password ?? 'qewret1324A@')
                    ->set('engine_version', '25.2.3')
                    ->set('filename', 'project.pptx')
                    ->set('timeout', 10);

            // --- PDF → PPTX ---
            } elseif ($inputFormat === 'pdf' && $outputFormat === 'pptx') {
                $convertTask = (new Task('convert', 'convert-task'))
                    ->set('input_format', $inputFormat)
                    ->set('output_format', $outputFormat)
                    ->set('engine', 'pdftron-pdf2powerpoint')
                    ->set('input', $inputTaskNames)
                    ->set('pages', $pages ?? null)
                    ->set('password', $password ?? null)
                    ->set('engine_version', '11.5.0')
                    ->set('filename', 'converted.' . $outputFormat)
                    ->set('timeout', 30);

            // --- PDF → XLSX ---
            } elseif ($inputFormat === 'pdf' && $outputFormat === 'xlsx') {
                $convertTask = (new Task('convert', 'convert-task'))
                    ->set('input_format', $inputFormat)
                    ->set('output_format', $outputFormat)
                    ->set('engine', 'pdftron-pdf2excel')
                    ->set('input', $inputTaskNames)
                    ->set('pages', $pages ?? null)
                    ->set('password', $password ?? null)
                    ->set('non_table_content', true)
                    ->set('single_sheet', false)
                    ->set('engine_version', '11.5.0')
                    ->set('filename', 'converted.' . $outputFormat)
                    ->set('timeout', 30);

            // --- XLSX → PDF ---
            } elseif ($inputFormat === 'xlsx' && $outputFormat === 'pdf') {
                $convertTask = (new Task('convert', 'convert-task'))
                    ->set('input_format', $inputFormat)
                    ->set('output_format', $outputFormat)
                    ->set('engine', 'libreoffice')
                    ->set('input', $inputTaskNames)
                    ->set('pages', $pages ?? null)
                    ->set('use_print_areas', false)
                    ->set('password', $password ?? null)
                    ->set('pdf_a', false)
                    ->set('engine_version', '25.2.3')
                    ->set('filename', 'converted.' . $outputFormat)
                    ->set('timeout', 30);

            // --- باقي التنسيقات ---
            } else {
                $convertTask = (new Task('convert', 'convert-task'))
                    ->set('input_format', $inputFormat)
                    ->set('output_format', $outputFormat)
                    ->set('engine', 'libreoffice')
                    ->set('input', $inputTaskNames)
                    ->set('connect_hyphens', false)
                    ->set('prioritize_visual_appearance', false)
                    ->set('images_ocr', true)
                    ->set('engine_version', '25.2.3')
                    ->set('filename', 'converted.' . $outputFormat)
                    ->set('timeout', 30);
            }

            $job->addTask($convertTask);
            $exportTask = (new Task('export/url', 'export-task'))
                ->set('input', 'convert-task');
            $job->addTask($exportTask);
            $job = $cloudconvert->jobs()->create($job);

            Log::info('📌 تم إنشاء المهمة', ['job_id' => $job->getId()]);

            foreach ($savedFiles as $index => $filePath) {
                $fullPath = storage_path('app/public/' . $filePath);

                if (!file_exists($fullPath)) {
                    throw new \Exception("الملف غير موجود في المسار: $fullPath");
                }

                $uploadTask = $job->getTasks()->whereName("import{$index}")[0];
                $inputStream = fopen($fullPath, 'r');
                if ($inputStream === false) {
                    throw new \Exception("فشل في فتح الملف: $fullPath");
                }

                try {
                    $cloudconvert->tasks()->upload($uploadTask, $inputStream);
                } finally {
                    if (is_resource($inputStream)) {
                        fclose($inputStream);
                    }
                }

                Log::info("📤 تم رفع الملف رقم {$index}");
            }

            $job = $cloudconvert->jobs()->wait($job);
            Log::info('⏳ المهمة اكتملت', ['status' => $job->getStatus()]);

            $exportTaskData = $job->getTasks()->whereName('export-task')[0];
            $downloadUrl = $exportTaskData->getResult()->files[0]->url ?? null;

            // حفظ العملية في جدول topics
            if ($downloadUrl) {
                $localPath = 'converted/' . uniqid() . '_converted.' . $outputFormat;
                $convertedFile = file_get_contents($downloadUrl);
                Storage::disk('public')->put($localPath, $convertedFile);

                Topic::create([
                    'user_id' => $user->id,
                    'title' => 'Converted PDF',
                    'file_path' => $localPath,
                    'download_url' => $downloadUrl,
                ]);

                $points->decrement('balance', 1);
            }

            return response()->json([
                'message' => 'تم رفع وتحويل الملفات بنجاح',
                'download_url' => $downloadUrl
            ]);

        } catch (\Exception $e) {
            Log::error('❌ خطأ أثناء التحويل', ['error' => $e->getMessage()]);
            return response()->json([
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}

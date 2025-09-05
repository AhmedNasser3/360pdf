<?php

namespace App\Services;

use App\DTOs\PdfMergeDTO;
use CloudConvert\CloudConvert;
use CloudConvert\Models\Job;
use CloudConvert\Models\Task;
use Exception;

class PdfMergeService
{
    protected $cloudConvert;

    public function __construct()
    {
        // استدعاء الـ API Key مباشرة من الـ env
        $this->cloudConvert = new CloudConvert([
            'api_key' => 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiOTk1MmVjOGFjYzlhMzllNDA3NDk0YmY3MTVkOTcyYmJjODU3MTdmZWUzYjYyNDQwZWI4ZjIwMjNkZjE1MTU1Y2JkMTkwYTI4MDMwZjYxMzMiLCJpYXQiOjE3NTQ3NDk3MjMuODgxMzQ3LCJuYmYiOjE3NTQ3NDk3MjMuODgxMzQ5LCJleHAiOjQ5MTA0MjMzMjMuODc2MjAxLCJzdWIiOiI3MjU4Mzk0OCIsInNjb3BlcyI6WyJ1c2VyLnJlYWQiLCJ1c2VyLndyaXRlIiwidGFzay5yZWFkIiwidGFzay53cml0ZSIsIndlYmhvb2sucmVhZCIsIndlYmhvb2sud3JpdGUiLCJwcmVzZXQucmVhZCIsInByZXNldC53cml0ZSJdfQ.LPI7VbduWF2fgHiIMV9Hhql20nWc7FDtcx3LZsgEfATdFQTAt0JZhVCk_JJ4gW4JoNS8IstbE6m_UWFUqodTnjwfv_-WZfIe8ynsstv_3jv2WCakdaCb4Q6cpI-Rq-MIl1vkkpyH66kZ7JsI0jxr_PK4S9vFbrPfj1GrbfPpJqpMY_zRBcNvsXpgIA9SLrQALo2xIac4TlqlZa4qboDcpyYvLEvw3mh7EA-h_bYQ0Q8bUz2gYbM5c3WJDXni2vSNormRzzS8ELRFZxSv_uIx1zRiJIi5BYY16tP2e8sg0Kg-n6BZQmP9Z-S2FYamRAPRzBW4F9izqnmfCS-u0ocIH5KXXTE07Jv_khfwOlmz0Zi5wRNhuYR6thL5qckNYtwSlK6ZJj0y7DLDKu0tYawPpOBNgjjB2Fwz3Ckzfzl9Q5qKzwwcbm0-YXn53oZjGepRTm16z9gA0YebkzQIoQGxZpdSfxUpEEcPWKo1cXNGI62un7xORRv7ZJXjq1DEsOD_tCKcGdu8DIVKDXGG06_kEjeo_Tu2sT13pmkzsLbEFEe23esTiVjx5UQKf2_aik671pQ68ooJ6S92rcNvHF91wyihgiRMQdfYYnsE5-9qWNFMczHQnd9KGtjYxcJ0duQ2P62Q9u7qyvf6eID5116ItZ10DZZCQTUH8M4IXsWK05c',
            'sandbox' => false // خليها true لو بتجرب على الـ sandbox
        ]);
    }

    public function handle(PdfMergeDTO $dto)
    {
        if (count($dto->file_paths) < 2) {
            throw new Exception("يجب دمج ملفين على الأقل.");
        }

        foreach ($dto->file_paths as $path) {
            if (!file_exists($path)) {
                throw new Exception("أحد الملفات غير موجود: {$path}");
            }
        }

        $job = new Job();
        $uploadTasks = [];

        // إنشاء مهام الرفع
        foreach ($dto->file_paths as $index => $filePath) {
            $taskName = "upload{$index}";
            $uploadTasks[] = (new Task('import/upload', $taskName));
        }

        foreach ($uploadTasks as $t) {
            $job->addTask($t);
        }

        // مهمة الدمج
        $mergeTask = (new Task('merge', 'merge'))
            ->set('input', array_map(fn($t) => $t->getName(), $uploadTasks))
            ->set('output_format', 'pdf');
        $job->addTask($mergeTask);

        // مهمة التصدير
        $exportTask = (new Task('export/url', 'export'))->set('input', 'merge');
        $job->addTask($exportTask);

        // إنشاء الوظيفة
        $created = $this->cloudConvert->jobs()->create($job);

        // رفع الملفات
        foreach ($dto->file_paths as $index => $filePath) {
            $task = $created->getTasks()->whereName("upload{$index}")[0];
            $this->cloudConvert->tasks()->upload($task, fopen($filePath, 'r'));
        }

        // انتظار التنفيذ
        $this->cloudConvert->jobs()->wait($created);

        // الحصول على الرابط
        $export = $created->getTasks()->filter(fn($t) => $t->getName() === 'export')[0];
        $files = $export->getResult()['files'];

        return (object)[
            'result_url' => $files[0]['url'],
        ];
    }
}

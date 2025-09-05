<?php
namespace App\Repositories;

use App\Models\api\PdfMergeJob;

class PdfMergeRepository
{
    public function create(array $data): PdfMergeJob
    {
        return PdfMergeJob::create($data);
    }

    public function update(PdfMergeJob $job, array $data): PdfMergeJob
    {
        $job->update($data);
        return $job;
    }
}
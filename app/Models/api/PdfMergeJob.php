<?php

namespace App\Models\api;

use Illuminate\Database\Eloquent\Model;

class PdfMergeJob extends Model
{
    protected $fillable = ['input_urls', 'status', 'result_url', 'cloudconvert_job_id'];

    protected $casts = [
        'input_urls' => 'array',
    ];
}

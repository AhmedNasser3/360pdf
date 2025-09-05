<?php

namespace App\DTOs;

class PdfMergeDTO
{
    public array $file_paths;

    public function __construct(array $file_paths)
    {
        $this->file_paths = $file_paths;
    }
}
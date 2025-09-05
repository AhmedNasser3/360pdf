<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PdfMergeRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array
    {
        return [
            'files'=>'required|array|min:2',
            'files.*'=>'required|file|mimes:pdf|max:10240',
        ];
    }
}
<?php

namespace App\Models\api;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class Topic extends Model
{
        protected $fillable = [
        'title', 'file_path', 'status', 'user_id'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

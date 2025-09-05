<?php

namespace App\Models\api;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Points extends Model
{
      use HasFactory;

    protected $fillable = ['user_id', 'balance'];

    // العلاقة مع المستخدم
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

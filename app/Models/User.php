<?php
// app/Models/User.php

namespace App\Models;

use App\Models\api\Topic;
use App\Scopes\ActiveScope;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    use Notifiable, HasApiTokens; // ← أزل SoftDeletes

    protected $fillable = ['name', 'email', 'password','status', 'topics','role'];
    protected $hidden = ['password', 'remember_token'];
    protected $casts = ['email_verified_at' => 'datetime'];

    protected static function booted()
    {
        static::addGlobalScope(new ActiveScope);
    }

    public function scopeWithEmailVerified($query)
    {
        return $query->whereNotNull('email_verified_at');
    }

    public static function findCached($id)
    {
        return cache()->remember("user:{$id}", now()->addMinutes(30), fn() => static::find($id));
    }

    // العلاقة مع نقاط المستخدم
    public function points()
    {
        return $this->hasOne(\App\Models\api\Points::class, 'user_id');
    }
    public function topics()
{
    return $this->hasMany(Topic::class,'user_id');
}

}

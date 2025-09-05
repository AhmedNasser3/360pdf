<?php
namespace App\Events;
use App\Models\User;
class UserCreated {
    public function __construct(public User $user) {}
}
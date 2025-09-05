<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;

class PointsUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $userId;
    public $points;

    public function __construct($userId, $points)
    {
        $this->userId = $userId;
        $this->points = $points;
    }

    public function broadcastOn()
    {
        return new Channel('points.' . $this->userId);
    }
}
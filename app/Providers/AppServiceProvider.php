<?php
namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Repositories\UserRepository;
use App\Services\UserService;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Binding the UserRepository as singleton (optional)
        $this->app->singleton(UserRepository::class, function ($app) {
            return new UserRepository();
        });

        // Binding the UserService and injecting the repository
        $this->app->singleton(UserService::class, function ($app) {
            return new UserService($app->make(UserRepository::class));
        });
    }

    public function boot(): void
    {
        //
    }
}

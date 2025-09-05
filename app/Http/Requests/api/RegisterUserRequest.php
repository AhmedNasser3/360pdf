<?php

namespace App\Http\Requests\api;

use Illuminate\Foundation\Http\FormRequest;

class RegisterUserRequest extends FormRequest {
    public function authorize(): bool {
        return true;
    }

    public function rules(): array {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ];
    }

    public function toDTO(): \App\DTO\CreateUserDTO {
        return new \App\DTO\CreateUserDTO(
            $this->input('name'),
            $this->input('email'),
            $this->input('password')
        );
    }
}

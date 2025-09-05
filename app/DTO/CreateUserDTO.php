<?php

namespace App\DTO;

class CreateUserDTO {
    public string $name;
    public string $email;
    public string $password;

    public function __construct(string $name, string $email, string $password) {
        $this->name = $name;
        $this->email = strtolower(trim($email));
        $this->password = $password;
    }
}
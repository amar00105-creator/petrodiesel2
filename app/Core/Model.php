<?php

namespace App\Core;

use App\Config\Database;

class Model
{
    // protected $db; // Removed to force usage of __get

    public function __construct()
    {
        // No cached connection
    }

    public function __get($name)
    {
        if ($name === 'db') {
            return \App\Config\Database::connect();
        }
        return null;
    }
}

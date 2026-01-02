<?php

namespace App\Core;

use App\Config\Database;

class Model
{
    protected $db;

    public function __construct()
    {
        $this->db = Database::connect();
    }
}

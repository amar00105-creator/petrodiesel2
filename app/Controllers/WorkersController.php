<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Helpers\AuthHelper;
use App\Models\Worker;

class WorkersController extends Controller
{
    public function __construct()
    {
        AuthHelper::requireLogin();
    }

    public function index()
    {
        $user = AuthHelper::user();
        $workerModel = new Worker();
        $workers = $workerModel->getAll($user['station_id']);

        $this->view('workers/index', ['workers' => $workers]);
    }

    public function create()
    {
        $this->view('workers/create');
    }

    public function store()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $user = AuthHelper::user();
            $data = $_POST;
            $data['station_id'] = $user['station_id'];

            $workerModel = new Worker();
            $workerModel->create($data);

            $this->redirect('/workers');
        }
    }
}

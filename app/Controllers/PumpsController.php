<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Helpers\AuthHelper;
use App\Models\Pump;
use App\Models\Counter;
use App\Models\Tank;

class PumpsController extends Controller
{
    public function __construct()
    {
        AuthHelper::requireLogin();
    }

    public function index()
    {
        $user = AuthHelper::user();
        $pumpModel = new Pump();
        $pumps = $pumpModel->getPumpsWithCounters($user['station_id']);

        $this->view('pumps/index', ['pumps' => $pumps]);
    }

    public function create()
    {
        // Need tanks for dropdown
        $user = AuthHelper::user();
        $db = \App\Config\Database::connect();
        $stmt = $db->prepare("SELECT * FROM tanks WHERE station_id = ?");
        $stmt->execute([$user['station_id']]);
        $tanks = $stmt->fetchAll();

        // Get workers for dropdown
        $stmt = $db->prepare("SELECT * FROM workers WHERE station_id = ? AND status = 'active'");
        $stmt->execute([$user['station_id']]);
        $workers = $stmt->fetchAll();

        $this->view('pumps/create', ['tanks' => $tanks, 'workers' => $workers]);
    }

    public function store()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $user = AuthHelper::user();
            $pumpModel = new Pump();

            $pumpId = $pumpModel->create([
                'station_id' => $user['station_id'],
                'tank_id' => $_POST['tank_id'],
                'name' => $_POST['name']
            ]);

            // Add counters if any (simple implementation: add one default counter or handle multiple)
            // For now, redirect to index where we can add counters
            // Or maybe the form allows adding counters immediately? 
            // Let's assume a separate flow for adding counters or just redirect for now.

            $this->redirect('/pumps');
        }
    }

    public function addCounter()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $counterModel = new Counter();
            $counterModel->create([
                'pump_id' => $_POST['pump_id'],
                'name' => $_POST['name'],
                'current_reading' => $_POST['current_reading']
            ]);
            $this->redirect('/pumps');
        }
    }
}

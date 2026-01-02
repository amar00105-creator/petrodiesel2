<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Models\Tank;
use App\Config\Constants;

class TankController extends Controller
{
    private $tankModel;

    public function __construct()
    {
        $this->tankModel = new Tank();
    }

    public function index()
    {
        // List all tanks with their current status
        $tanks = $this->tankModel->getAll();
        
        // Pass to view
        $this->view('tanks/index', ['tanks' => $tanks]);
    }

    public function create()
    {
        $this->view('tanks/create');
    }

    public function store()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = [
                'station_id' => 1, // Default station for now
                'name' => $_POST['name'] ?? '',
                'product_type' => $_POST['product_type'] ?? 'Diesel',
                'capacity_liters' => $_POST['capacity_liters'] ?? 0,
                'current_volume' => $_POST['current_volume'] ?? 0,
                'current_price' => $_POST['current_price'] ?? 0,
            ];

            if ($this->tankModel->create($data)) {
                $this->redirect('/tanks');
            } else {
                echo "Failed to create tank";
            }
        }
    }

    public function calibration()
    {
        $tanks = $this->tankModel->getAll();
        $this->view('tanks/calibration', ['tanks' => $tanks]);
    }

    public function saveCalibration()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = [
                'tank_id' => $_POST['tank_id'],
                'user_id' => 1, // Hardcoded for now, should be session user
                'reading_cm' => $_POST['reading_cm'],
                'volume_liters' => $_POST['volume_liters'],
                'reading_type' => $_POST['reading_type'],
                // Variance calculated in Model if not passed
            ];

            if ($this->tankModel->addReading($data)) {
                $this->redirect('/tanks/calibration');
            } else {
                echo "Failed to save reading";
            }
        }
    }
}

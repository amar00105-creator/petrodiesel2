<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Models\Station;
use App\Helpers\AuthHelper;

class StationController extends Controller
{

    public function __construct()
    {
        AuthHelper::requireLogin();
        // Check if user is Super Admin
        $user = AuthHelper::user();
        if ($user['role'] !== 'super_admin') {
            die("Access Denied: Super Admin only.");
        }
    }

    public function index()
    {
        $stationModel = new Station();
        $stations = $stationModel->getAll();
        $this->view('admin/stations/index', ['stations' => $stations]);
    }

    public function create()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $stationModel = new Station();
            $data = [
                'name' => $_POST['name'],
                'address' => $_POST['address'],
                'phone' => $_POST['phone']
            ];
            $stationModel->create($data);
            $this->redirect('/stations');
        } else {
            $this->view('admin/stations/create');
        }
    }

    public function edit()
    {
        $id = $_GET['id'] ?? null;
        if (!$id) $this->redirect('/stations');

        $stationModel = new Station();
        $station = $stationModel->find($id);

        if (!$station) $this->redirect('/stations');

        $this->view('admin/stations/edit', ['station' => $station]);
    }

    public function update()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $id = $_POST['id'];
            $data = [
                'name' => $_POST['name'],
                'address' => $_POST['address'],
                'phone' => $_POST['phone']
            ];
            
            // Station Model needs an update method
            // We'll add it or use raw query if model lacks it (Model usually has basic update)
            // Checking Station Model previously... it didn't have update (only create/getAll/find).
            // I need to add update/delete to Station Model first or do it here.
            // Let's rely on Model having it or adding it. Ideally update Model.
            
            // For now, let's look at Station Model again? 
            // I'll assume I can add it or it inherits from Core/Model? 
            // Core/Model usually empty. 
            // I will implement update/delete in Station Model next.
            
            $stationModel = new Station();
            $stationModel->update($id, $data);
            
            $this->redirect('/stations');
        }
    }

    public function delete()
    {
        $id = $_POST['id'] ?? null;
        if ($id) {
            $stationModel = new Station();
            $stationModel->delete($id);
        }
        $this->redirect('/stations');
    }
}

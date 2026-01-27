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
        // Redirect to Settings (Consolidated View)
        $this->redirect('/settings');
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
    public function delete_ajax()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') return;
        header('Content-Type: application/json');

        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? null;

        if ($id) {
            $stationModel = new Station();
            if ($stationModel->delete($id)) {
                echo json_encode(['success' => true]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to delete']);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'ID required']);
        }
        exit;
    }

    public function save_ajax()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') return;
        header('Content-Type: application/json');
        $data = json_decode(file_get_contents('php://input'), true);

        $stationModel = new Station();
        $saveData = [
            'name' => $data['name'],
            'address' => $data['address'] ?? '',
            'phone' => $data['phone'] ?? ''
        ];

        try {
            if (!empty($data['id'])) {
                $stationModel->update($data['id'], $saveData);
            } else {
                $stationModel->create($saveData);
            }
            echo json_encode(['success' => true]);
        } catch (\Exception $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        exit;
    }

    public function assign_user()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') return;
        header('Content-Type: application/json');
        $data = json_decode(file_get_contents('php://input'), true);

        $userId = $data['user_id'] ?? null;
        $stationId = $data['station_id'] ?? null;
        $action = $data['action'] ?? 'set'; // 'add', 'remove', 'set'

        if (!$userId) {
            echo json_encode(['success' => false, 'message' => 'User ID required']);
            exit;
        }

        $db = \App\Config\Database::connect();
        try {
            if ($action === 'remove') {
                if (!$stationId) throw new \Exception('Station ID required for removal');

                // Remove from user_stations
                $stmt = $db->prepare("DELETE FROM user_stations WHERE user_id = ? AND station_id = ?");
                $stmt->execute([$userId, $stationId]);

                // If this was the 'primary' station (legacy column), set it to null or another one
                $stmt = $db->prepare("SELECT station_id FROM users WHERE id = ?");
                $stmt->execute([$userId]);
                $currentPrimary = $stmt->fetchColumn();

                if ($currentPrimary == $stationId) {
                    // Pick another one if exists
                    $stmt = $db->prepare("SELECT station_id FROM user_stations WHERE user_id = ? LIMIT 1");
                    $stmt->execute([$userId]);
                    $nextStation = $stmt->fetchColumn();

                    $stmt = $db->prepare("UPDATE users SET station_id = ? WHERE id = ?");
                    $stmt->execute([$nextStation ?: null, $userId]);
                }
            } elseif ($action === 'add') {
                if (!$stationId) throw new \Exception('Station ID required for assignment');

                // Add to user_stations
                $stmt = $db->prepare("INSERT IGNORE INTO user_stations (user_id, station_id) VALUES (?, ?)");
                $stmt->execute([$userId, $stationId]);

                // Update legacy column if empty
                $stmt = $db->prepare("UPDATE users SET station_id = ? WHERE id = ? AND station_id IS NULL");
                $stmt->execute([$stationId, $userId]);
            } else {
                // If action is NOT 'add' or 'remove', and we have a stationId, assume 'add' (safe default)
                if ($stationId) {
                    $stmt = $db->prepare("INSERT IGNORE INTO user_stations (user_id, station_id) VALUES (?, ?)");
                    $stmt->execute([$userId, $stationId]);
                    // Update legacy
                    $stmt = $db->prepare("UPDATE users SET station_id = ? WHERE id = ? AND station_id IS NULL");
                    $stmt->execute([$stationId, $userId]);
                }
            }

            echo json_encode(['success' => true, 'message' => 'User assignment updated']);
        } catch (\Exception $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        exit;
    }
}

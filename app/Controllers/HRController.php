<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Helpers\AuthHelper;
use App\Models\User;
use App\Models\Worker;
use App\Models\Driver;
use App\Models\Supplier;
use App\Models\Customer;

class HRController extends Controller
{
    private $models = [];

    public function __construct()
    {
        $this->models = [
            'employee' => new User(),
            'worker' => new Worker(),
            'driver' => new Driver(),
            'supplier' => new Supplier(),
            'customer' => new Customer()
        ];
    }

    public function index()
    {
        $user = AuthHelper::user();
        if (!$user) {
            header('Location: ' . BASE_URL . '/login');
            exit;
        }

        $stationId = $user['station_id'] ?? null;

        // Fetch all data for initial view
        $data = [
            'user' => $user,
            'tab' => $_GET['tab'] ?? 'employees',
            'employees' => $this->models['employee']->getAll($stationId),
            'workers' => $this->models['worker']->getAll($stationId),
            'drivers' => $this->models['driver']->getAll(),
            'suppliers' => $this->models['supplier']->getAll($stationId),
            'customers' => $this->models['customer']->getAll($stationId),
            'userRole' => $user['role'] // Pass role for UI logic
        ];

        $this->view('hr/index', $data);
    }

    // Unified API for AJAX calls
    // Route: /hr/api?entity={entity}&action={action}
    public function handleApi()
    {
        header('Content-Type: application/json');
        
        // DEBUG LOGGING
        $debugFile = __DIR__ . '/../../debug_hr.log';
        $logMsg = date('Y-m-d H:i:s') . " - Request: " . print_r($_REQUEST, true) . "\n";
        file_put_contents($debugFile, $logMsg, FILE_APPEND);

        $user = AuthHelper::user();
        if (!$user) {
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            exit;
        }

        $entity = $_GET['entity'] ?? null;
        $action = $_GET['action'] ?? null;

        if (!$entity || !isset($this->models[$entity])) {
            echo json_encode(['success' => false, 'message' => 'Invalid or missing entity']);
            exit;
        }

        $model = $this->models[$entity];
        $role = $user['role'];
        $stationId = $user['station_id'] ?? 1;

        // RBAC Checks
        if ($action === 'delete') {
             if ($role !== 'admin' && $role !== 'super_admin') {
                 echo json_encode(['success' => false, 'message' => 'Permission denied. Admins only.']);
                 exit;
             }
        } elseif ($action === 'store' || $action === 'update') {
             if ($role !== 'admin' && $role !== 'super_admin' && $role !== 'manager') {
                 echo json_encode(['success' => false, 'message' => 'Permission denied. Viewers cannot edit.']);
                 exit;
             }
        }

        try {
            if ($action === 'store') {
                $postData = $_POST;
                $postData['station_id'] = $stationId;
                
                // Debug Post Data
                file_put_contents($debugFile, "Store Data: " . print_r($postData, true) . "\n", FILE_APPEND);

                if ($entity === 'employee') {
                     if (!empty($postData['password'])) {
                         $postData['password_hash'] = password_hash($postData['password'], PASSWORD_DEFAULT);
                     }
                     if (empty($postData['email'])) {
                        $postData['email'] = strtolower(str_replace(' ', '.', $postData['name'])) . rand(100,999) . '@petrodiesel.net';
                     }
                }

                $id = $model->create($postData);
                file_put_contents($debugFile, "Result ID: $id\n", FILE_APPEND);
                
                echo json_encode(['success' => true, 'message' => 'Created successfully', 'id' => $id]);

            } elseif ($action === 'update') {
                $id = $_POST['id'];
                if (!$id) throw new \Exception("Missing ID");
                
                $postData = $_POST;
                if ($entity === 'employee') {
                    if (empty($postData['password'])) {
                        unset($postData['password_hash']);
                    } else {
                        $postData['password_hash'] = password_hash($postData['password'], PASSWORD_DEFAULT);
                    }
                }

                $model->update($id, $postData);
                echo json_encode(['success' => true, 'message' => 'Updated successfully']);

            } elseif ($action === 'delete') {
                $id = $_POST['id'];
                if (!$id) throw new \Exception("Missing ID");
                
                $model->delete($id);
                echo json_encode(['success' => true, 'message' => 'Deleted successfully']);
                
            } elseif ($action === 'list') {
                $stationId = $user['station_id'] ?? null;
                if ($entity === 'driver') {
                    $data = $model->getAll(); 
                } else {
                    $data = $model->getAll($stationId);
                }
                echo json_encode(['success' => true, 'data' => $data]);

            } elseif ($action === 'get') {
                $id = $_GET['id'] ?? null;
                if (!$id) throw new \Exception("Missing ID");
                $data = $model->find($id);
                echo json_encode(['success' => true, 'data' => $data]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Invalid action']);
            }

        } catch (\Exception $e) {
            $errMsg = $e->getMessage();
            file_put_contents($debugFile, "ERROR: $errMsg\n", FILE_APPEND);
            echo json_encode(['success' => false, 'message' => $errMsg]);
        }
    }
}

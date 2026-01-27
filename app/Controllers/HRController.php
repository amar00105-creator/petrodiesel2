<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Helpers\AuthHelper;
use App\Models\Staff;
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
            'employee' => new Staff(),
            'worker' => new Worker(),
            'driver' => new Driver(),
            'supplier' => new Supplier(),
            'customer' => new Customer(),
            'payroll' => new \App\Models\Payroll()
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
            // We can load initial salaries if needed, or fetch via AJAX
            'userRole' => $user['role'],
            'additional_js' => \App\Helpers\ViteHelper::load('resources/js/main.jsx')
        ];

        // Initial Load Data
        $data = [
            'user' => $user,
            'tab' => $_GET['tab'] ?? 'employees',
            'employees' => $this->models['employee']->getAll($stationId),
            'workers' => $this->models['worker']->getAll($stationId),
            'drivers' => $this->models['driver']->getAll(),
            'suppliers' => $this->models['supplier']->getAll($stationId),
            'customers' => $this->models['customer']->getAll($stationId),
            // We can load initial salaries if needed, or fetch via AJAX
            'userRole' => $user['role'],
            'additional_js' => \App\Helpers\ViteHelper::load('resources/js/main.jsx'),
            'hide_topbar' => true
        ];

        $this->view('hr/index', $data);
    }

    // Unified API for AJAX calls
    // Route: /hr/api?entity={entity}&action={action}
    public function handleApi()
    {
        header('Content-Type: application/json');

        $debugFile = __DIR__ . '/../../debug_hr.log';
        // log...

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

        // RBAC Checks (Granular)
        $permissionMap = [
            'employee' => 'employees',
            'customer' => 'customers',
            'driver' => 'drivers',
            'worker' => 'workers',
            'supplier' => 'suppliers',
            'payroll' => 'payroll'
        ];

        $permPrefix = $permissionMap[$entity] ?? $entity;

        if ($action === 'delete') {
            if (!AuthHelper::can($permPrefix . '_delete')) {
                echo json_encode(['success' => false, 'message' => 'Unauthorized: Missing ' . $permPrefix . '_delete permission']);
                exit;
            }
        } elseif (in_array($action, ['store', 'update', 'set_salary', 'add_entry'])) {
            if (!AuthHelper::can($permPrefix . '_edit')) { // Assume _edit covers create/update
                echo json_encode(['success' => false, 'message' => 'Unauthorized: Missing ' . $permPrefix . '_edit permission']);
                exit;
            }
        }

        try {
            if ($entity === 'payroll') {
                $subAction = $action;
                // specific payroll actions
                if ($subAction === 'get_salary') {
                    $eType = $_GET['e_type'];
                    $eId = $_GET['e_id'];
                    $amount = $model->getSalary($eType, $eId);
                    echo json_encode(['success' => true, 'amount' => $amount]);
                } elseif ($subAction === 'set_salary') {
                    $eType = $_POST['e_type'];
                    $eId = $_POST['e_id'];
                    $amount = $_POST['amount'];
                    $model->setSalary($eType, $eId, $amount);
                    echo json_encode(['success' => true]);
                } elseif ($subAction === 'add_entry') {
                    $data = [
                        'entity_type' => $_POST['e_type'],
                        'entity_id' => $_POST['e_id'],
                        'type' => $_POST['type'],
                        'amount' => $_POST['amount'],
                        'notes' => $_POST['notes'] ?? '',
                        'date' => $_POST['date'] ?? date('Y-m-d'),
                        'created_by' => $user['id']
                    ];
                    $model->addEntry($data);
                    echo json_encode(['success' => true]);
                } elseif ($subAction === 'get_entries') {
                    $eType = $_GET['e_type'];
                    $eId = $_GET['e_id'];
                    $month = $_GET['month'] ?? date('m');
                    $year = $_GET['year'] ?? date('Y');
                    $entries = $model->getEntries($eType, $eId, $month, $year);
                    echo json_encode(['success' => true, 'data' => $entries]);
                } elseif ($subAction === 'get_monthly_summary') {
                    $month = $_GET['month'] ?? date('m');
                    $year = $_GET['year'] ?? date('Y');
                    $summary = $model->getMonthlySummary($month, $year);
                    echo json_encode(['success' => true, 'data' => $summary]);
                }
                return;
            }

            // Normal Entity Actions
            if ($action === 'store') {
                $postData = $_POST;
                $postData['station_id'] = $stationId;

                // Validate station_id for all entities to prevent SQL errors
                if (empty($postData['station_id'])) {
                    $postData['station_id'] = 0;
                }

                if ($entity === 'employee') {
                    if (!empty($postData['password'])) {
                        $postData['password_hash'] = password_hash($postData['password'], PASSWORD_DEFAULT);
                    }
                    if (empty($postData['email'])) {
                        $postData['email'] = strtolower(str_replace(' ', '.', $postData['name'])) . rand(100, 999) . '@petrodiesel.net';
                    }
                }

                $id = $model->create($postData);
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
            echo json_encode(['success' => false, 'message' => $errMsg]);
        }
    }
}

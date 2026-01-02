<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Models\Role;
use App\Helpers\AuthHelper;

class RolesController extends Controller
{
    public function __construct()
    {
        AuthHelper::requireLogin();
        // Check permissions here as well
    }

    public function index()
    {
        $roleModel = new Role();
        $roles = $roleModel->getAll();
        $this->view('admin/roles/index', ['roles' => $roles]);
    }

    public function create()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $roleModel = new Role();
            
            // Process Permissions
            // Permissions come as array from checkboxes e.g. permissions['sales_view']
            $permissions = $_POST['permissions'] ?? [];
            
            $data = [
                'name' => $_POST['name'],
                'description' => $_POST['description'],
                'permissions' => $permissions
            ];

            $roleModel->create($data);
            $this->redirect('/roles');
        } else {
            $this->view('admin/roles/create');
        }
    }

    public function edit()
    {
        $id = $_GET['id'] ?? null;
        if (!$id) $this->redirect('/roles');

        $roleModel = new Role();
        $role = $roleModel->find($id);

        if (!$role) $this->redirect('/roles');
        
        // Decode permissions if stored as JSON string in fetch
        if (is_string($role['permissions'])) {
            $role['permissions'] = json_decode($role['permissions'], true) ?? [];
        }

        $this->view('admin/roles/edit', ['role' => $role]);
    }

    public function update()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $id = $_POST['id'];
            $roleModel = new Role();
            
            $permissions = $_POST['permissions'] ?? [];

            $data = [
                'name' => $_POST['name'],
                'description' => $_POST['description'],
                'permissions' => $permissions
            ];

            $roleModel->update($id, $data);
            $this->redirect('/roles');
        }
    }

    public function delete()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $id = $_POST['id'];
            $roleModel = new Role();
            $roleModel->delete($id);
            $this->redirect('/roles');
        }
    }
}

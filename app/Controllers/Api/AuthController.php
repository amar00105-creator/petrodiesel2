<?php

namespace App\Controllers\Api;

use App\Core\Controller;
use App\Models\User;
use App\Helpers\JwtHelper;

class AuthController extends Controller
{
    private function jsonResponse($data, $code = 200)
    {
        header('Content-Type: application/json');
        http_response_code($code);
        echo json_encode($data);
        exit;
    }

    public function login()
    {
        $input = json_decode(file_get_contents('php://input'), true);
        $email = $input['email'] ?? $_POST['email'] ?? '';
        $password = $input['password'] ?? $_POST['password'] ?? '';

        if (!$email || !$password) {
            $this->jsonResponse(['status' => false, 'message' => 'Email and Password are required'], 400);
        }

        $userModel = new User();
        // Assuming findByEmail exists as seen in Web AuthController
        $user = $userModel->findByEmail($email);

        if ($user && password_verify($password, $user['password_hash'])) {
            $payload = [
                'user_id' => $user['id'],
                'email' => $user['email'],
                'role' => $user['role_id'] ?? 'worker', 
                'station_id' => $user['station_id'] ?? null
            ];
            
            $token = JwtHelper::encode($payload);
            
            $this->jsonResponse([
                'status' => true,
                'token' => $token,
                'user' => [
                    'id' => $user['id'],
                    'name' => $user['name'] ?? 'User',
                    'email' => $user['email'],
                    'role' => $user['role_id'] ?? 'worker' 
                ]
            ]);
        } else {
            $this->jsonResponse(['status' => false, 'message' => 'Invalid Credentials'], 401);
        }
    }

    public function logout()
    {
        $this->jsonResponse(['status' => true, 'message' => 'Logged out successfully']);
    }
}

<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Models\Staff;
use App\Helpers\AuthHelper;

class AuthController extends Controller
{

    public function login()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $email = $_POST['email'] ?? '';
            $password = $_POST['password'] ?? '';

            $userModel = new Staff();
            $user = $userModel->findByEmail($email);

            if ($user && password_verify($password, $user['password_hash'])) {
                AuthHelper::login($user);

                // Log successful login
                try {
                    $logModel = new \App\Models\ActivityLog();
                    $logModel->log($user['id'], 'login', 'session', null, "تسجيل دخول: {$user['name']}");
                } catch (\Exception $e) {
                    // Silently fail if logging fails
                }

                $this->redirect('/');
            } else {
                $error = "البريد الإلكتروني أو كلمة المرور غير صحيحة";
                $this->view('auth/login', ['error' => $error], false);
            }
        } else {
            $this->view('auth/login', [], false);
        }
    }

    public function logout()
    {
        // Log logout before destroying session
        try {
            $user = AuthHelper::user();
            if ($user) {
                $logModel = new \App\Models\ActivityLog();
                $logModel->log($user['id'], 'logout', 'session', null, "تسجيل خروج: {$user['name']}");
            }
        } catch (\Exception $e) {
            // Silently fail if logging fails
        }

        AuthHelper::logout();
        $this->redirect('/login');
    }
    public function verify_password()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            header('Content-Type: application/json');

            $user = AuthHelper::user();
            if (!$user) {
                echo json_encode(['success' => false, 'message' => 'Not logged in']);
                exit;
            }

            // We need to fetch the password hash from DB again to be sure
            $userModel = new Staff();
            $dbUser = $userModel->findByEmail($user['email']); // Assuming user table calls it email

            if (!$dbUser) {
                // Try User model if Staff didn't work (AuthHelper might use generic array)
                $userModel = new \App\Models\User();
                $dbUser = $userModel->findByEmail($user['email']);
            }

            $password = $_POST['password'] ?? '';

            if ($dbUser && password_verify($password, $dbUser['password_hash'])) {
                echo json_encode(['success' => true]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Invalid password']);
            }
            exit;
        }
    }
}

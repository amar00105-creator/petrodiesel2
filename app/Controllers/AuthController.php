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
            $identifier = trim($_POST['identifier'] ?? $_POST['email'] ?? '');
            $password = $_POST['password'] ?? '';

            $userModel = new Staff();

            // Try to find by email or username
            $user = $userModel->findByEmailOrUsername($identifier);

            if ($user && password_verify($password, $user['password_hash'])) {
                AuthHelper::login($user);
                $_SESSION['just_logged_in'] = true;
                setcookie('just_logged_in', '1', time() + 60, '/'); // Cookie expires in 60 seconds

                // Log successful login
                try {
                    $logModel = new \App\Models\ActivityLog();
                    $logModel->log($user['id'], 'login', 'session', null, "تسجيل دخول: {$user['name']}");
                } catch (\Exception $e) {
                    // Silently fail if logging fails
                }

                $this->redirect('/');
            } else {
                $error = "البريد الإلكتروني/اسم المستخدم أو كلمة المرور غير صحيحة";
                $this->view('auth/login', ['error' => $error], false);
            }
        } else {
            $this->view('auth/login', [], false);
        }
    }

    public function showRegister()
    {
        $this->view('auth/register', [], false);
    }

    public function register()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $username = trim($_POST['username'] ?? '');
            $name = trim($_POST['name'] ?? '');
            $email = trim($_POST['email'] ?? '');
            $password = $_POST['password'] ?? '';
            $password_confirm = $_POST['password_confirm'] ?? '';

            $errors = [];

            // Validation
            if (empty($username)) {
                $errors[] = "اسم المستخدم مطلوب";
            } elseif (strlen($username) < 3) {
                $errors[] = "اسم المستخدم يجب أن يكون 3 أحرف على الأقل";
            } elseif (!preg_match('/^[a-zA-Z0-9_]+$/', $username)) {
                $errors[] = "اسم المستخدم يجب أن يحتوي على حروف إنجليزية وأرقام فقط";
            }

            if (empty($name)) {
                $errors[] = "الاسم الكامل مطلوب";
            }

            if (empty($email)) {
                $errors[] = "البريد الإلكتروني مطلوب";
            } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $errors[] = "البريد الإلكتروني غير صحيح";
            }

            if (empty($password)) {
                $errors[] = "كلمة المرور مطلوبة";
            } elseif (strlen($password) < 6) {
                $errors[] = "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
            }

            if ($password !== $password_confirm) {
                $errors[] = "كلمة المرور وتأكيدها غير متطابقتين";
            }

            // Check unique constraints
            if (empty($errors)) {
                $userModel = new Staff();

                if ($userModel->findByEmail($email)) {
                    $errors[] = "البريد الإلكتروني مسجل بالفعل";
                }

                if ($userModel->findByUsername($username)) {
                    $errors[] = "اسم المستخدم مستخدم بالفعل";
                }
            }

            if (!empty($errors)) {
                $this->view('auth/register', [
                    'errors' => $errors,
                    'old' => [
                        'username' => $username,
                        'name' => $name,
                        'email' => $email
                    ]
                ], false);
                return;
            }

            // Create User
            try {
                $userModel = new Staff();
                $userId = $userModel->create([
                    'username' => $username,
                    'name' => $name,
                    'email' => $email,
                    'password_hash' => password_hash($password, PASSWORD_DEFAULT),
                    'role' => 'viewer'
                ]);

                // Log registration
                try {
                    $logModel = new \App\Models\ActivityLog();
                    $logModel->log($userId, 'register', 'session', null, "تسجيل حساب جديد: {$name}");
                } catch (\Exception $e) {
                    // Silently fail
                }

                // Redirect to login with success message
                $this->view('auth/login', ['success' => 'تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.'], false);
            } catch (\Exception $e) {
                $this->view('auth/register', [
                    'errors' => ['حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى.'],
                    'old' => [
                        'username' => $username,
                        'name' => $name,
                        'email' => $email
                    ]
                ], false);
            }
        } else {
            $this->showRegister();
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

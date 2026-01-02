<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Models\User;
use App\Helpers\AuthHelper;

class AuthController extends Controller
{

    public function login()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $email = $_POST['email'] ?? '';
            $password = $_POST['password'] ?? '';

            $userModel = new User();
            $user = $userModel->findByEmail($email);

            if ($user && password_verify($password, $user['password_hash'])) {
                AuthHelper::login($user);
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
        AuthHelper::logout();
        $this->redirect('/login');
    }
}

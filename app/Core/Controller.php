<?php

namespace App\Core;

class Controller
{
    public function view($view, $data = [], $layout = 'main')
    {
        // Extract data to variables
        extract($data);

        $viewPath = "../views/" . $view . ".php";
        $layoutPath = "../views/layouts/" . $layout . ".php";

        if (file_exists($viewPath)) {
            // If layout is requested, render view into a variable, then include layout
            if ($layout) {
                $child_view = $viewPath;
                if (file_exists($layoutPath)) {
                    require_once $layoutPath;
                } else {
                    die("Layout '$layout' does not exist.");
                }
            } else {
                require_once $viewPath;
            }
        } else {
            die("View '$view' does not exist.");
        }
    }

    public function model($model)
    {
        $modelClass = "App\\Models\\" . $model;
        if (class_exists($modelClass)) {
            return new $modelClass();
        } else {
            die("Model '$model' not found.");
        }
    }

    public function redirect($url)
    {
        // If url doesn't start with http, prepend BASE_URL
        if (strpos($url, 'http') !== 0) {
            $url = BASE_URL . $url;
        }
        header("Location: " . $url);
        exit();
    }
}

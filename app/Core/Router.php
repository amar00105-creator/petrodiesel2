<?php

namespace App\Core;

class Router
{
    protected $routes = [];

    public function add($method, $path, $controller, $action)
    {
        $this->routes[] = [
            'method' => $method,
            'path' => $path,
            'controller' => $controller,
            'action' => $action
        ];
    }

    public function dispatch($uri, $method)
    {
        // Simple router logic: exact match or basic parsing
        // Remove query string and decode
        $uri = urldecode(parse_url($uri, PHP_URL_PATH));

        // Remove base path if needed (e.g. /PETRODIESEL/public)
        // Adjust this depending on server config using $_SERVER['SCRIPT_NAME'] logic
        $scriptDir = dirname($_SERVER['SCRIPT_NAME']);
        if ($scriptDir !== '/' && stripos($uri, $scriptDir) === 0) {
            $uri = substr($uri, strlen($scriptDir));
        }
        if ($uri === false || $uri === '') {
            $uri = '/';
        }

        foreach ($this->routes as $route) {
            if ($route['path'] === $uri && $route['method'] === $method) {
                $controllerClass = "App\\Controllers\\" . $route['controller'];
                $action = $route['action'];

                if (class_exists($controllerClass)) {
                    $controller = new $controllerClass();
                    if (method_exists($controller, $action)) {
                        return $controller->$action();
                    }
                }
            }
        }

        // 404
        echo "404 Not Found";
    }
}

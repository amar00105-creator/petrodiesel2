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
        // Remove query string
        $uri = parse_url($uri, PHP_URL_PATH);

        // Detect script directory relative to document root for robust base path handling
        $scriptDir = dirname($_SERVER['SCRIPT_NAME']);
        $scriptDir = str_replace('\\', '/', $scriptDir);

        // Fallback: If SCRIPT_NAME yields root but we are likely in a subdir (based on physical path)
        if ($scriptDir === '/') {
            $docRoot = str_replace('\\', '/', $_SERVER['DOCUMENT_ROOT']);
            $projectRoot = str_replace('\\', '/', dirname(__DIR__, 2));
            $publicPath = $projectRoot . '/public';

            // Case-insensitive check if public path starts with doc root
            if (stripos($publicPath, $docRoot) === 0) {
                $relPath = substr($publicPath, strlen($docRoot));
                if (!empty($relPath)) {
                    $scriptDir = $relPath;
                }
            }
        }

        if ($scriptDir !== '/' && stripos($uri, $scriptDir) === 0) {
            $uri = substr($uri, strlen($scriptDir));
        }

        // Handle /index.php/route vs /route
        if (strpos($uri, '/index.php') === 0) {
            $uri = substr($uri, 10); // Remove /index.php
        }

        // Clean URI: Remove trailing slashes and dots (e.g. from copy-paste errors)
        $uri = rtrim($uri, '/.');

        if ($uri === false || $uri === '') {
            $uri = '/';
        }



        // Handle Preflight OPTIONS requests
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            header("HTTP/1.1 200 OK");
            exit;
        }

        // First Pass: Try Exact Match
        foreach ($this->routes as $route) {
            if ($route['path'] === $uri && strtoupper($route['method']) === strtoupper($method)) {
                return $this->executeRoute($route);
            }
        }

        // Second Pass: Try stripping /public if present (Fix for hosting environments where base path detection fails)
        if (strpos($uri, '/public') !== false) {
            // Extract everything after /public
            $parts = explode('/public', $uri, 2);
            if (isset($parts[1])) {
                $altUri = $parts[1];
                if (empty($altUri)) $altUri = '/'; // Handle trailing /public

                foreach ($this->routes as $route) {
                    if ($route['path'] === $altUri && strtoupper($route['method']) === strtoupper($method)) {

                        return $this->executeRoute($route);
                    }
                }
            }
        }

        // 404
        http_response_code(404);
        echo "404 - الصفحة غير موجودة";
    }

    private function executeRoute($route)
    {
        $controllerClass = "App\\Controllers\\" . $route['controller'];
        $action = $route['action'];

        if (class_exists($controllerClass)) {
            $controller = new $controllerClass();
            if (method_exists($controller, $action)) {
                return $controller->$action();
            } else {
                error_log("Router: Method $action NOT FOUND in $controllerClass");
                http_response_code(404);
                echo "404 - الصفحة غير موجودة";
            }
        } else {
            error_log("Router: Class $controllerClass NOT FOUND");
            http_response_code(404);
            echo "404 - الصفحة غير موجودة";
        }
    }
}

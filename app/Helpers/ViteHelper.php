<?php

namespace App\Helpers;

class ViteHelper
{
    /**
     * Load Vite assets (script and css)
     *
     * @param string $entry The entry point file path (e.g., 'resources/js/main.jsx')
     * @return string HTML tags for script and css
     */
    public static function load($entry)
    {
        $manifestPath = __DIR__ . '/../../public/build/.vite/manifest.json';
        $isLive = defined('BASE_URL') && strpos(BASE_URL, 'app.petrodiesel.net') !== false;

        // Check if manifest exists (Production Build)
        if (file_exists($manifestPath)) {
            $manifest = json_decode(file_get_contents($manifestPath), true);
            $version = time(); // FORCE CACHE BUST

            if (isset($manifest[$entry])) {
                $item = $manifest[$entry];
                $baseUrl = defined('BASE_URL') ? BASE_URL : '';
                $scriptFile = $baseUrl . '/build/' . $item['file'] . "?v={$version}";

                $html = "<script type=\"module\" src=\"{$scriptFile}\"></script>";

                if (isset($item['css'])) {
                    foreach ($item['css'] as $cssFile) {
                        $cssPath = $baseUrl . '/build/' . $cssFile . "?v={$version}";
                        $html .= "<link rel=\"stylesheet\" href=\"{$cssPath}\">";
                    }
                }

                return $html;
            }
        }

        // If on Live and manifest is missing, DO NOT fallback to localhost
        if ($isLive) {
            return "<script>console.error('Vite Manifest not found! Please ensure public/build is uploaded.'); alert('Deployment Error: Build assets missing. Please upload public/build folder.');</script>";
        }

        // Default to Dev Server (Localhost only)
        $devServerUrl = 'http://localhost:5173';
        return "
            <script type=\"module\" src=\"{$devServerUrl}/@vite/client\"></script>
            <script type=\"module\">
                import RefreshRuntime from '{$devServerUrl}/@react-refresh'
                RefreshRuntime.injectIntoGlobalHook(window)
                window.\$RefreshReg\$ = () => {}
                window.\$RefreshSig\$ = () => (type) => type
                window.__vite_plugin_react_preamble_installed__ = true
            </script>
            <script type=\"module\" src=\"{$devServerUrl}/{$entry}\"></script>
        ";
    }
}

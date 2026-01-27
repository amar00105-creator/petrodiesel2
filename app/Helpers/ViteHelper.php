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
        $devServerUrl = 'http://localhost:5173';
        $manifestPath = __DIR__ . '/../../public/build/.vite/manifest.json';

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

        // Default to Dev Server
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

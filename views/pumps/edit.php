<?php
// views/pumps/edit.php
// Check if dev server is running
$isDev = false;
$devServerUrl = 'http://localhost:5173';
$headers = @get_headers($devServerUrl);
if ($headers && strpos($headers[0], '200')) {
    $isDev = true;
}

$cssFile = '';
$jsFile = '';

if (!$isDev) {
    // Try different manifest locations
    $manifestPath = __DIR__ . '/../../public/build/.vite/manifest.json';
    if (!file_exists($manifestPath)) {
        $manifestPath = __DIR__ . '/../../public/build/manifest.json';
    }

    if (file_exists($manifestPath)) {
        $manifest = json_decode(file_get_contents($manifestPath), true);
        $cssFile = $manifest['resources/js/main.jsx']['css'][0] ?? '';
        $jsFile = $manifest['resources/js/main.jsx']['file'] ?? '';
    }
}

// Prepare JSON Data
$tanksJson = json_encode($tanks ?? []);
$workersJson = json_encode($workers ?? []);
$statsJson = json_encode($stats ?? []);
$pumpJson = json_encode($pump ?? []);
$countersJson = json_encode($counters ?? []);
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تعديل الماكينة | بتروديزل</title>

    <!-- Cairo Font -->
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">

    <?php
    // Dynamic Base Path for Assets
    $scriptDir = dirname($_SERVER['SCRIPT_NAME']);
    // Ensure we don't have backslashes and remove /views/pumps if present (unlikely for script_name but safe)
    $scriptDir = str_replace('\\', '/', $scriptDir);
    // If the script is running from public/index.php, dirname is /project/public. 
    // If we are in a view include, context matters. But usually we want the public root.
    // Let's assume public/index.php is the entry point.
    // A robust way is to use the calculated base path from the router or config, 
    // but here we can try to detect 'public' in the path.

    $baseUrl = '/PETRODIESEL2/public'; // Fallback
    if (strpos($scriptDir, '/public') !== false) {
        $baseUrl = substr($scriptDir, 0, strpos($scriptDir, '/public') + 7);
    }
    ?>

    <?php if ($isDev): ?>
        <script type="module">
            import RefreshRuntime from 'http://localhost:5173/@react-refresh'
            RefreshRuntime.injectIntoGlobalHook(window)
            window.$RefreshReg$ = () => {}
            window.$RefreshSig$ = () => (type) => type
            window.__vite_plugin_react_preamble_installed__ = true
        </script>
        <script type="module" src="http://localhost:5173/@vite/client"></script>
        <script type="module" src="http://localhost:5173/resources/js/main.jsx"></script>
    <?php else: ?>
        <link rel="stylesheet" href="<?= $baseUrl ?>/build/<?= $cssFile ?>">
    <?php endif; ?>

    <style>
        body {
            font-family: 'Cairo', sans-serif;
            background-color: #f8fafc;
        }
    </style>
</head>

<?php
// Debugging Output (Hidden in production usually, but we need it now)
// echo "<!-- Debug: ScriptDir: $scriptDir -->";
// echo "<!-- Debug: BaseURL: $baseUrl -->";
// echo "<!-- Debug: Manifest Path: $manifestPath -->";
// echo "<!-- Debug: JS File: $jsFile -->";
?>

<div id="root"
    data-page="edit-pump"
    data-base-url="<?= $baseUrl ?>"
    data-pump='<?= $pumpJson ?>'
    data-counters='<?= $countersJson ?>'
    data-tanks='<?= $tanksJson ?>'
    data-workers='<?= $workersJson ?>'
    data-stats='<?= $statsJson ?>'>
    <div style="padding: 50px; text-align: center; color: #64748b;">
        <p style="font-size: 1.5rem; font-weight: bold;">Loading Application...</p>
        <p style="font-size: 0.8rem; margin-top: 10px;">If this persists, please check console.</p>
        <!-- Debug Info:
                 Msg: <?= htmlspecialchars($jsFile ? 'JS Found' : 'JS Not Found') ?>
                 BaseURL: <?= htmlspecialchars($baseUrl) ?>
                 JS: <?= htmlspecialchars($jsFile) ?>
            -->
    </div>
</div>

<?php if (!$isDev): ?>
    <?php if ($jsFile): ?>
        <script type="module" src="<?= $baseUrl ?>/build/<?= $jsFile ?>"></script>
    <?php else: ?>
        <script>
            console.error("Critical: Manifest file not found or JS file missing.");
        </script>
        <div style="background: #fee2e2; color: #991b1b; padding: 20px; text-align: center; margin: 20px;">
            Critical Error: Build assets not found.<br>
            Manifest Path: <?= htmlspecialchars($manifestPath) ?>
        </div>
    <?php endif; ?>
<?php endif; ?>
</body>

</html>
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
        <link rel="stylesheet" href="/PETRODIESEL2/public/build/<?= $cssFile ?>">
    <?php endif; ?>

    <style>
        body {
            font-family: 'Cairo', sans-serif;
            background-color: #f8fafc;
        }
    </style>
</head>

<body class="bg-slate-50">
    <div id="root"
        data-page="edit-pump"
        data-base-url="/PETRODIESEL2/public"
        data-pump='<?= $pumpJson ?>'
        data-counters='<?= $countersJson ?>'
        data-tanks='<?= $tanksJson ?>'
        data-workers='<?= $workersJson ?>'
        data-stats='<?= $statsJson ?>'></div>

    <?php if (!$isDev): ?>
        <script type="module" src="/PETRODIESEL2/public/build/<?= $jsFile ?>"></script>
    <?php endif; ?>
</body>

</html>
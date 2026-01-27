<!DOCTYPE html>
<html>

<head>
    <title>Rewrite Test</title>
    <style>
        body {
            font-family: sans-serif;
            padding: 2rem;
        }

        a {
            display: block;
            margin: 10px 0;
            padding: 10px;
            background: #eee;
        }
    </style>
</head>

<body>
    <h2>Rewrite Environment Test</h2>
    <p>Current Time: <?php echo date('Y-m-d H:i:s'); ?></p>

    <h3>Server Info</h3>
    <pre>
    URI: <?php echo htmlspecialchars($_SERVER['REQUEST_URI'] ?? 'N/A'); ?>
    Script: <?php echo htmlspecialchars($_SERVER['SCRIPT_NAME'] ?? 'N/A'); ?>
    Soft: <?php echo htmlspecialchars($_SERVER['SERVER_SOFTWARE'] ?? 'N/A'); ?>
    </pre>

    <h3>Test Links</h3>
    <a href="index.php/sales/create">1. Direct PHP Access (Should Work) - /index.php/sales/create</a>
    <a href="sales/create">2. Rewritten Access (The Issue) - /sales/create</a>

    <?php
    if (strpos($_SERVER['REQUEST_URI'], 'sales/create') !== false) {
        echo "<h3 style='color:green'>SUCCESS! Request was routed to PHP.</h3>";
    }
    ?>
</body>

</html>
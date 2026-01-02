<?php
// Wrapper to run the migration from browser
header('Content-Type: text/plain');
require_once __DIR__ . '/../database/migrate_finance.php';

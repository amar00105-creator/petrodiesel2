<?php
// debug_db.php
require_once 'app/Config/Database.php';

try {
    $db = \App\Config\Database::connect();
    // Check for payroll tables
    $tables = ['salaries', 'payroll_entries'];
    $output = "";

    foreach ($tables as $table) {
        try {
            $stmt = $db->query("SELECT 1 FROM $table LIMIT 1");
            $output .= "Table '$table' exists.\n";
        } catch (Exception $e) {
            $output .= "Table '$table' MISSING or Error: " . $e->getMessage() . "\n";
        }
    }
    $output .= "Data Dump:\n" . print_r($safes, true);

    // Check for JSON encoding issues
    $json = json_encode($safes);
    if ($json === false) {
        $output .= "\nJSON ENCODE ERROR: " . json_last_error_msg();
    } else {
        $output .= "\nJSON Encode Success. Length: " . strlen($json);
    }

    file_put_contents('db_debug_output.txt', $output);
    echo "Debug dump created in db_debug_output.txt";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}

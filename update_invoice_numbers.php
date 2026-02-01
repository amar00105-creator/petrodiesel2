<?php
// Update all invoice numbers to new format: SYYMM0001
require_once __DIR__ . '/app/Config/Database.php';

$db = \App\Config\Database::connect();

echo "=== Updating Invoice Numbers ===\n\n";

// Get all sales ordered by created_at
$stmt = $db->query("SELECT id, invoice_number, created_at, station_id FROM sales ORDER BY created_at ASC");
$sales = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Group by year-month-station
$grouped = [];
foreach ($sales as $sale) {
    $date = $sale['created_at'];
    $yearMonth = date('ym', strtotime($date));
    $stationId = $sale['station_id'];
    $key = $yearMonth . '_' . $stationId;

    if (!isset($grouped[$key])) {
        $grouped[$key] = [];
    }
    $grouped[$key][] = $sale;
}

// Update each group with sequential numbering
$updateStmt = $db->prepare("UPDATE sales SET invoice_number = ? WHERE id = ?");
$updated = 0;

foreach ($grouped as $key => $salesGroup) {
    list($yearMonth, $stationId) = explode('_', $key);
    $sequence = 1;

    foreach ($salesGroup as $sale) {
        $newInvoiceNumber = 'S' . $yearMonth . str_pad($sequence, 4, '0', STR_PAD_LEFT);

        if ($sale['invoice_number'] !== $newInvoiceNumber) {
            $updateStmt->execute([$newInvoiceNumber, $sale['id']]);
            echo "Updated Sale #{$sale['id']}: {$sale['invoice_number']} → {$newInvoiceNumber}\n";
            $updated++;
        }

        $sequence++;
    }
}

echo "\n=== Done! Updated {$updated} invoice numbers ===\n";

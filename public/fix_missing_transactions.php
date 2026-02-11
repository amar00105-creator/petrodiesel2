<?php
// Fix Missing Transactions Script v2 (Refined)
require_once __DIR__ . '/../app/Config/Constants.php';
require_once __DIR__ . '/../app/Config/Database.php';

use App\Config\Database;

header('Content-Type: text/plain; charset=utf-8');

try {
    $db = Database::connect();
    echo "Starting Migration: Fix Missing Transactions (v2)...\n";
    echo "------------------------------------------------\n";

    // 1. Fix Expenses
    echo "1. Checking Expenses...\n";
    $stmt = $db->query("SELECT * FROM expenses");
    $expenses = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $eCount = 0;
    $eSkipped = 0;

    foreach ($expenses as $e) {
        // Tag description with ID for idempotency checks
        $tag = " #EXP-" . $e['id'];

        // Check if transaction exists (by looking for tag in description)
        $checkSql = "SELECT id FROM transactions WHERE type = 'expense' AND description LIKE ?";
        $checkStmt = $db->prepare($checkSql);
        $checkStmt->execute(['%' . $tag]);

        if (!$checkStmt->fetch()) {
            $sql = "INSERT INTO transactions (
                station_id, type, amount, from_type, from_id, description, 
                related_entity_type, related_entity_id, date, created_by, created_at
            ) VALUES (
                ?, 'expense', ?, ?, ?, ?, 
                ?, ?, ?, ?, ?
            )";

            // Preserve original entity type (e.g. supplier) or default to 'expense' if generic
            // Actually if related_entity_type is null, we can set 'expense' or null.
            // Reports expect 'supplier','customer','sales'. 'expense' entity type might be valid/expected by some reports.
            // If null, let's keep it null.
            // But Description will have the ID.

            $relType = $e['related_entity_type'] ?? null;
            $relId = $e['related_entity_id'] ?? null;

            // If no entity type, maybe categorize as 'general_expense'?
            // But let's stick to null to match Controller logic if Controller sends null.
            // Wait, Controller sends user input.

            $desc = $e['category'] . ' - ' . ($e['description'] ?? '') . $tag;

            $stmtInsert = $db->prepare($sql);
            $stmtInsert->execute([
                $e['station_id'],
                $e['amount'],
                $e['source_type'],
                $e['source_id'],
                $desc,
                $relType,
                $relId,
                $e['expense_date'],
                $e['user_id'],
                $e['created_at']
            ]);
            $eCount++;
        } else {
            $eSkipped++;
        }
    }
    echo "Fixed $eCount expenses. (Skipped $eSkipped)\n\n";

    // 2. Fix Purchases (Paid Amount > 0)
    echo "2. Checking Purchases (Paid Amount)...\n";
    $stmt = $db->query("SELECT * FROM purchases WHERE paid_amount > 0");
    $purchases = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $pCount = 0;
    $pSkipped = 0;

    foreach ($purchases as $p) {
        $tag = " #PUR-" . $p['id'];
        $checkStmt = $db->prepare("SELECT id FROM transactions WHERE type = 'expense' AND description LIKE ?");
        $checkStmt->execute(['%' . $tag]);

        if (!$checkStmt->fetch()) {
            $sql = "INSERT INTO transactions (
                station_id, type, amount, from_type, from_id, description, 
                related_entity_type, related_entity_id, date, created_by, created_at
            ) VALUES (
                ?, 'expense', ?, ?, ?, ?, 
                'supplier', ?, ?, ?, ?
            )";

            $desc = 'سداد فاتورة مشتريات' . $tag;
            $fromType = $p['payment_source_type'] ?? null;
            $fromId = $p['payment_source_id'] ?? null;

            $stmtInsert = $db->prepare($sql);
            $stmtInsert->execute([
                $p['station_id'] ?? 1,
                $p['paid_amount'],
                $fromType,
                $fromId,
                $desc,
                $p['supplier_id'],
                date('Y-m-d', strtotime($p['created_at'])),
                1,
                $p['created_at']
            ]);
            $pCount++;
        } else {
            $pSkipped++;
        }
    }
    echo "Fixed $pCount purchases. (Skipped $pSkipped)\n\n";

    // 3. Fix Credit Sales
    echo "3. Checking Credit Sales...\n";
    $stmt = $db->query("SELECT * FROM sales WHERE payment_method = 'credit' AND total_amount > 0");
    $sales = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $sCount = 0;
    $sSkipped = 0;

    foreach ($sales as $s) {
        // Tag not really needed if we query by related_entity_type='sales' AND id
        // Controller sets related_entity_type='sales' later?
        // Wait, Controller sets 'to_type'='customer'.
        // It DOES NOT set related_entity_type='sales' in the Credit block in my previous edit!
        // In my edit: $transactionData['related_entity_type'] = null/sales? 
        // Let's check SalesController again.
        // It reused $transactionData. 
        // $transactionData initialized at line 290: 'related_entity_type' => 'sales', 'related_entity_id' => $saleId.
        // So yes, it IS set.
        // So we can robustly detect existing by related_entity_id.

        $checkStmt = $db->prepare("SELECT id FROM transactions WHERE related_entity_type = 'sales' AND related_entity_id = ?");
        $checkStmt->execute([$s['id']]);

        if (!$checkStmt->fetch()) {
            $sql = "INSERT INTO transactions (
                station_id, type, amount, to_type, to_id, description, 
                related_entity_type, related_entity_id, date, created_by, created_at
            ) VALUES (
                ?, 'income', ?, 'customer', ?, ?, 
                'sales', ?, ?, ?, ?
            )";

            $desc = "مبيعات آجل - عملية " . $s['invoice_number'];
            $stmtInsert = $db->prepare($sql);
            $stmtInsert->execute([
                $s['station_id'],
                $s['total_amount'],
                $s['customer_id'],
                $desc,
                $s['id'],
                $s['sale_date'],
                $s['user_id'],
                $s['created_at']
            ]);
            $sCount++;
        } else {
            $sSkipped++;
        }
    }
    echo "Fixed $sCount credit sales. (Skipped $sSkipped)\n\n";
    echo "Done.\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}

<?php
// Fix for missing invoice_number column
require_once __DIR__ . '/../app/Config/Database.php';

use App\Config\Database;

try {
    $db = Database::connect();

    // Check if column exists
    $stmt = $db->query("SHOW COLUMNS FROM sales LIKE 'invoice_number'");
    $exists = $stmt->fetch();

    if (!$exists) {
        $db->exec("ALTER TABLE sales ADD COLUMN invoice_number VARCHAR(50) DEFAULT NULL AFTER id");
        // Update existing records
        $stmt = $db->query("SELECT id, created_at FROM sales");
        $sales = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $updateStmt = $db->prepare("UPDATE sales SET invoice_number = ? WHERE id = ?");

        foreach ($sales as $sale) {
            $year = date('y', strtotime($sale['created_at'] ?? 'now'));
            $month = date('m', strtotime($sale['created_at'] ?? 'now'));
            $invoiceNum = 'S' . $year . $month . $sale['id'];
            $updateStmt->execute([$invoiceNum, $sale['id']]);
        }

        echo json_encode(['success' => true, 'message' => 'Migration successful: Column added and data backfilled.']);
    } else {
        echo json_encode(['success' => true, 'message' => 'Column already exists.']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database Error: ' . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}

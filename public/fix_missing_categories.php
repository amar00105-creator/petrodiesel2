<?php
// Fix Missing Categories Script
// Parses 'description' of expense transactions to extract category name and update 'category_id'
require_once __DIR__ . '/../app/Config/Constants.php';
require_once __DIR__ . '/../app/Config/Database.php';

use App\Config\Database;

header('Content-Type: text/plain; charset=utf-8');

try {
    $db = Database::connect();
    echo "Starting Migration: Fix Missing Categories...\n";
    echo "------------------------------------------------\n";

    // Select expenses with missing category_id
    $stmt = $db->query("SELECT * FROM transactions WHERE type = 'expense' AND category_id IS NULL");
    $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo "Found " . count($transactions) . " transactions with missing category.\n";

    $count = 0;
    foreach ($transactions as $t) {
        $desc = $t['description'];

        // Format was: "Category - Description"
        // We try to split by " - "
        $parts = explode(' - ', $desc, 2);

        if (count($parts) >= 1) {
            $categoryName = trim($parts[0]);

            if (empty($categoryName)) continue;

            // Check if it's a "Payment" (e.g. "سداد فاتورة ...")
            // These might not have a specific category, or should be "Supplier Payment"
            // If it starts with "سداد", maybe skip or assign to "Supplier Payment" category?
            // The user wanted "Band Name" (Item Name) check.
            // If it is "سداد فاتورة مشتريات", let's make a category "سداد موردين" (Supplier Payments)?
            // Or just keep it null? The user specifically complained about "Expenses" (Items).
            // Let's focus on those that look like Expenses.
            // If related_entity_type is 'supplier', it is a Payment.

            if ($t['related_entity_type'] === 'supplier') {
                $categoryName = 'سداد موردين';
            }

            // Lookup or Create Category
            // We need to handle duplicates carefully (trim spaces)
            $stmtCat = $db->prepare("SELECT id FROM transaction_categories WHERE name = ? AND type = 'expense'");
            $stmtCat->execute([$categoryName]);
            $cat = $stmtCat->fetch(PDO::FETCH_ASSOC);

            $catId = null;
            if ($cat) {
                $catId = $cat['id'];
            } else {
                $stmtCreate = $db->prepare("INSERT INTO transaction_categories (name, type) VALUES (?, 'expense')");
                $stmtCreate->execute([$categoryName]);
                $catId = $db->lastInsertId();
                echo "Created new category: $categoryName\n";
            }

            // Update Transaction
            $stmtUpd = $db->prepare("UPDATE transactions SET category_id = ? WHERE id = ?");
            $stmtUpd->execute([$catId, $t['id']]);
            $count++;
        }
    }

    echo "Fixed $count transactions.\n";
    echo "Done.\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}

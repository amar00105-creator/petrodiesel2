<?php
require_once __DIR__ . '/app/Config/Database.php';

use App\Config\Database;

$db = Database::connect();

echo "Setting up Finance Module Database...\n";

// 1. Create transaction_categories table
$sql = "CREATE TABLE IF NOT EXISTS transaction_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type ENUM('expense', 'income') NOT NULL,
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";
$db->exec($sql);
echo "- transaction_categories table created/checked.\n";

// 2. Seed Categories
$categories = [
    // Expenses
    ['Purchases', 'expense', 1],
    ['Salaries', 'expense', 1],
    ['Electricity', 'expense', 1],
    ['Operational', 'expense', 1],
    ['Maintenance', 'expense', 1],
    ['Rent', 'expense', 1],
    ['Government Fees', 'expense', 1],
    // Income
    ['Sales', 'income', 1],
    ['Other', 'income', 1]
];

$stmt = $db->prepare("SELECT COUNT(*) FROM transaction_categories WHERE name = ? AND type = ?");
$insert = $db->prepare("INSERT INTO transaction_categories (name, type, is_system) VALUES (?, ?, ?)");

foreach ($categories as $cat) {
    $stmt->execute([$cat[0], $cat[1]]);
    if ($stmt->fetchColumn() == 0) {
        $insert->execute($cat);
        echo "  - Added category: {$cat[0]}\n";
    }
}

// 3. Update transactions table
// Check if columns exist first to avoid errors
$columns = $db->query("SHOW COLUMNS FROM transactions")->fetchAll(PDO::FETCH_COLUMN);

if (!in_array('category_id', $columns)) {
    $db->exec("ALTER TABLE transactions ADD COLUMN category_id INT NULL DEFAULT NULL AFTER id");
    echo "- Added column: category_id\n";
}

if (!in_array('related_entity_type', $columns)) {
    $db->exec("ALTER TABLE transactions ADD COLUMN related_entity_type VARCHAR(50) NULL DEFAULT NULL");
    echo "- Added column: related_entity_type\n";
}

if (!in_array('related_entity_id', $columns)) {
    $db->exec("ALTER TABLE transactions ADD COLUMN related_entity_id INT NULL DEFAULT NULL");
    echo "- Added column: related_entity_id\n";
}

echo "Database setup completed successfully.\n";

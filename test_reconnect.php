<?php
require_once 'app/Config/Database.php';
require_once 'app/Core/Model.php';
require_once 'app/Models/Finance.php';
require_once 'app/Models/Transaction.php';
require_once 'app/Models/Supplier.php';
require_once 'app/Models/TransactionCategory.php';
require_once 'app/Models/Customer.php';

use App\Models\Transaction;
use App\Models\Safe;
use App\Models\Bank;
use App\Models\Supplier;
use App\Models\TransactionCategory;
use App\Models\Customer;

echo "Testing Models...\n";

try {
    $t = new Transaction();
    $history = $t->getHistory(1, 1);
    echo "[PASS] Transaction::getHistory\n";
} catch (Exception $e) {
    echo "[FAIL] Transaction::getHistory: " . $e->getMessage() . "\n";
}

try {
    $s = new Safe();
    $safes = $s->getAll();
    echo "[PASS] Safe::getAll\n";
} catch (Exception $e) {
    echo "[FAIL] Safe::getAll: " . $e->getMessage() . "\n";
}

try {
    $b = new Bank();
    $banks = $b->getAll();
    echo "[PASS] Bank::getAll\n";
} catch (Exception $e) {
    echo "[FAIL] Bank::getAll: " . $e->getMessage() . "\n";
}

try {
    $sup = new Supplier();
    // Supplier might need DB table setup, if it fails it might be table missing but connection works
    $sups = $sup->getAll();
    echo "[PASS] Supplier::getAll\n";
} catch (Exception $e) {
    echo "[FAIL] Supplier::getAll: " . $e->getMessage() . "\n";
}

try {
    $cat = new TransactionCategory();
    $cats = $cat->getAll();
    echo "[PASS] TransactionCategory::getAll\n";
} catch (Exception $e) {
    echo "[FAIL] TransactionCategory::getAll: " . $e->getMessage() . "\n";
}

try {
    $cust = new Customer();
    $custs = $cust->getAll();
    echo "[PASS] Customer::getAll\n";
} catch (Exception $e) {
    echo "[FAIL] Customer::getAll: " . $e->getMessage() . "\n";
}

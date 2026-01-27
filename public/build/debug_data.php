<?php
require_once __DIR__ . '/../app/Config/Database.php';
require_once __DIR__ . '/../app/Core/Model.php';
require_once __DIR__ . '/../app/Models/Tank.php';
require_once __DIR__ . '/../app/Models/Purchase.php';
require_once __DIR__ . '/../app/Models/Sale.php';

use App\Models\Tank;
use App\Models\Purchase;
use App\Models\Sale;

class DebugData
{
    public $tankModel;
    public $purchaseModel;
    public $saleModel;

    public function __construct()
    {
        $this->tankModel = new Tank();
        $this->purchaseModel = new Purchase();
        $this->saleModel = new Sale();
    }

    public function run()
    {
        $stationId = 1; // Explicitly use Station 1 usually
        $startDate = '2026-01-01';
        $endDate = '2026-01-31';

        echo "--- Data Check for $startDate to $endDate ---\n";

        // Check Sales
        $sales = $this->saleModel->getDailySalesByTank($stationId, $startDate, $endDate);
        echo "Daily Sales Rows: " . count($sales) . "\n";
        print_r($sales);

        // Check Purchases
        $purchases = $this->purchaseModel->getDailyPurchasesByTank($stationId, $startDate, $endDate);
        echo "Daily Purchases Rows: " . count($purchases) . "\n";
        print_r($purchases);

        // Check Readings
        $readings = $this->tankModel->getDailyReadings($stationId, $startDate, $endDate);
        echo "Daily Readings Rows: " . count($readings) . "\n";
        print_r($readings);

        // Check ALL readings
        $stmt = $this->tankModel->getDb()->query("SELECT COUNT(*) FROM tank_readings");
        echo "Total Readings in DB: " . $stmt->fetchColumn() . "\n";
    }
}

$debug = new DebugData();
$debug->run();

<?php
require_once __DIR__ . '/../app/Config/Database.php';
require_once __DIR__ . '/../app/Core/Model.php';
require_once __DIR__ . '/../app/Models/Tank.php';
require_once __DIR__ . '/../app/Models/Purchase.php';
require_once __DIR__ . '/../app/Models/Sale.php';

use App\Models\Tank;
use App\Models\Purchase;
use App\Models\Sale;

class DebugReports
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
        $stationId = 'all';
        $startDate = '2026-01-01';
        $endDate = '2026-01-31';

        echo "Fetching Tanks...\n";
        $tanks = $this->tankModel->getAll();
        echo "Tanks Count: " . count($tanks) . "\n";

        $evaporationLoss = 0;
        $tankStats = array_map(function ($t) use ($startDate, $endDate, &$evaporationLoss) {
            echo "Processing Tank: " . $t['name'] . "\n";
            $lastCal = $this->tankModel->getLastCalibration($t['id']);
            echo "Last Cal: $lastCal\n";

            $opening = $this->tankModel->getReadingAt($t['id'], $startDate);
            echo "Opening: " . json_encode($opening) . "\n";

            return [
                'name' => $t['name']
            ];
        }, $tanks);

        echo "Tank Stats Count: " . count($tankStats) . "\n";
    }
}

$debug = new DebugReports();
$debug->run();

<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Models\Setting;
use App\Helpers\AuthHelper;

class SettingsController extends Controller
{
    public function __construct()
    {
        AuthHelper::requireLogin();
        // Permission check can be added here
        // if (!AuthHelper::can('settings_view')) { ... }
    }

    public function index()
    {
        $settingModel = new Setting();
        
        // Load all settings grouped by section
        $generalSettings = $settingModel->getAllBySection('general');
        $fuelSettings = $settingModel->getAllBySection('fuel');
        $alertSettings = $settingModel->getAllBySection('alerts');

        $this->view('admin/settings/index', [
            'general' => $generalSettings,
            'fuel' => $fuelSettings,
            'alerts' => $alertSettings
        ]);
    }

    public function update()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $settingModel = new Setting();
            $section = $_POST['section'] ?? 'general';
            
            // Loop through posted data and update settings
            foreach ($_POST as $key => $value) {
                if ($key === 'section') continue;
                
                // Update Setting
                $settingModel->set($key, $value, $section);

                // Specific Logic for Fuel Prices
                if ($section === 'fuel') {
                    $this->updateTankPrices($key, $value);
                }
            }

            // Redirect back with success message (if flash messaging existed)
            $this->redirect('/settings?section=' . $section);
        }
    }

    private function updateTankPrices($key, $value)
    {
        $productType = null;
        if ($key === 'price_diesel') $productType = 'Diesel';
        if ($key === 'price_petrol') $productType = 'Petrol';

        if ($productType) {
            $db = \App\Config\Database::connect();
            $stmt = $db->prepare("UPDATE tanks SET current_price = ? WHERE product_type = ?");
            $stmt->execute([$value, $productType]);
        }
    }
}

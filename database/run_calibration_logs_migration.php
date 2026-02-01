&lt;?php
/**
* Create calibration_logs table migration
* Run this file once to create the table
*/

require_once __DIR__ . '/../app/Config/Database.php';

use App\Config\Database;

try {
$db = Database::connect();

$sql = file_get_contents(__DIR__ . '/create_calibration_logs.sql');

$db->exec($sql);

echo "&lt;h2 style='color: green;'&gt;✓ تم إنشاء جدول calibration_logs بنجاح!&lt;/h2&gt;";
echo "&lt;p&gt;Table: calibration_logs created successfully&lt;/p&gt;";
echo "&lt;p&gt;&lt;a href='../public/tanks'&gt;العودة إلى الخزانات&lt;/a&gt;&lt;/p&gt;";

} catch (Exception $e) {
echo "&lt;h2 style='color: red;'&gt;✗ خطأ في إنشاء الجدول&lt;/h2&gt;";
echo "&lt;p&gt;Error: " . htmlspecialchars($e-&gt;getMessage()) . "&lt;/p&gt;";
}
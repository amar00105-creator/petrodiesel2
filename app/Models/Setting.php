<?php

namespace App\Models;

use App\Core\Model;
use PDO;

class Setting extends Model
{
    /**
     * Get a setting value by key
     */
    public function get($key, $stationId = null, $default = null)
    {
        $sql = "SELECT value, type FROM settings WHERE key_name = ? AND (station_id = ? OR station_id IS NULL) ORDER BY station_id DESC LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$key, $stationId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$result) {
            return $default;
        }

        // Convert based on type
        switch ($result['type']) {
            case 'boolean':
                return (bool)$result['value'];
            case 'integer':
                return (int)$result['value'];
            case 'json':
                return json_decode($result['value'], true);
            default:
                return $result['value'];
        }
    }

    /**
     * Set a setting value
     */
    public function set($key, $value, $stationId = null, $section = 'general', $type = 'string')
    {
        // Convert value based on type
        if ($type === 'json') {
            $value = json_encode($value);
        } elseif ($type === 'boolean') {
            $value = $value ? '1' : '0';
        }

        $sql = "INSERT INTO settings (station_id, section, key_name, value, type) 
                VALUES (?, ?, ?, ?, ?) 
                ON DUPLICATE KEY UPDATE value = ?, updated_at = CURRENT_TIMESTAMP";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute([$stationId, $section, $key, $value, $type, $value]);
    }

    /**
     * Get all settings
     */
    public function getAll($stationId = null)
    {
        $sql = "SELECT * FROM settings WHERE station_id = ? OR station_id IS NULL ORDER BY section, key_name";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$stationId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get all settings by section
     */
    public function getAllBySection($section, $stationId = null)
    {
        $sql = "SELECT * FROM settings WHERE section = ? AND (station_id = ? OR station_id IS NULL) ORDER BY key_name";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$section, $stationId]);

        // Convert to key-value array
        $result = [];
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($rows as $row) {
            $result[$row['key_name']] = $row['value'];
        }
        return $result;
    }
}

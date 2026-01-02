<?php

namespace App\Models;

use App\Core\Model;
use PDO;

class Setting extends Model
{
    protected $table = 'settings';

    /**
     * Get a setting value by key and optional station_id
     * Hierarchy: Station Setting -> Global Setting -> Default
     */
    public function get($key, $stationId = null, $default = null)
    {
        // 1. Try to find station specific setting
        if ($stationId) {
            $stmt = $this->db->prepare("SELECT value, type FROM {$this->table} WHERE key_name = ? AND station_id = ?");
            $stmt->execute([$key, $stationId]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($result) {
                return $this->castValue($result['value'], $result['type']);
            }
        }

        // 2. Try to find global setting (station_id IS NULL)
        $stmt = $this->db->prepare("SELECT value, type FROM {$this->table} WHERE key_name = ? AND station_id IS NULL");
        $stmt->execute([$key]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($result) {
            return $this->castValue($result['value'], $result['type']);
        }

        return $default;
    }

    /**
     * Set a setting value
     */
    public function set($key, $value, $section = 'general', $stationId = null, $type = 'string')
    {
        // Check if exists
        $sql = "SELECT id FROM {$this->table} WHERE key_name = ? AND ";
        $params = [$key];
        
        if ($stationId) {
            $sql .= "station_id = ?";
            $params[] = $stationId;
        } else {
            $sql .= "station_id IS NULL";
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $exists = $stmt->fetch();

        if (is_array($value) || is_object($value)) {
            $value = json_encode($value);
            $type = 'json';
        }

        if ($exists) {
            $updateSql = "UPDATE {$this->table} SET value = ?, type = ? WHERE id = ?";
            $updateStmt = $this->db->prepare($updateSql);
            return $updateStmt->execute([$value, $type, $exists['id']]);
        } else {
            $insertSql = "INSERT INTO {$this->table} (station_id, section, key_name, value, type) VALUES (?, ?, ?, ?, ?)";
            $insertStmt = $this->db->prepare($insertSql);
            return $insertStmt->execute([$stationId, $section, $key, $value, $type]);
        }
    }

    public function getAllBySection($section, $stationId = null)
    {
        $sql = "SELECT * FROM {$this->table} WHERE section = ? AND ";
        $params = [$section];

        if ($stationId) {
            $sql .= "(station_id = ? OR station_id IS NULL)";
            $params[] = $stationId;
        } else {
            $sql .= "station_id IS NULL";
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $settings = [];
        foreach ($results as $row) {
            $settings[$row['key_name']] = $this->castValue($row['value'], $row['type']);
        }
        return $settings;
    }

    private function castValue($value, $type)
    {
        switch ($type) {
            case 'integer': return (int)$value;
            case 'boolean': return (bool)$value;
            case 'json': return json_decode($value, true);
            default: return $value;
        }
    }
}

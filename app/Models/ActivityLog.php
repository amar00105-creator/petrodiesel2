<?php

namespace App\Models;

use App\Core\Model;
use PDO;

class ActivityLog extends Model
{
    protected $table = 'activity_logs';

    /**
     * Log an activity
     */
    public function log($userId, $action, $entityType, $entityId = null, $description = null, $oldValues = null, $newValues = null)
    {
        $stationId = $_SESSION['station_id'] ?? null;
        $userName = $_SESSION['user_name'] ?? null;
        $ipAddress = $_SERVER['REMOTE_ADDR'] ?? null;
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? null;

        $sql = "INSERT INTO {$this->table} 
                (station_id, user_id, user_name, action, entity_type, entity_id, description, old_values, new_values, ip_address, user_agent)
                VALUES (:station_id, :user_id, :user_name, :action, :entity_type, :entity_id, :description, :old_values, :new_values, :ip_address, :user_agent)";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':station_id' => $stationId,
            ':user_id' => $userId,
            ':user_name' => $userName,
            ':action' => $action,
            ':entity_type' => $entityType,
            ':entity_id' => $entityId,
            ':description' => $description,
            ':old_values' => $oldValues ? json_encode($oldValues, JSON_UNESCAPED_UNICODE) : null,
            ':new_values' => $newValues ? json_encode($newValues, JSON_UNESCAPED_UNICODE) : null,
            ':ip_address' => $ipAddress,
            ':user_agent' => $userAgent
        ]);
    }

    /**
     * Get recent activity logs
     */
    public function getRecent($limit = 100, $stationId = null)
    {
        $sql = "SELECT al.*, u.name as user_display_name
                FROM {$this->table} al
                LEFT JOIN users u ON al.user_id = u.id";

        $params = [];
        if ($stationId) {
            $sql .= " WHERE al.station_id = :station_id OR al.station_id IS NULL";
            $params[':station_id'] = $stationId;
        }

        $sql .= " ORDER BY al.created_at DESC LIMIT :limit";

        $stmt = $this->db->prepare($sql);
        $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get logs by user
     */
    public function getByUser($userId, $limit = 50)
    {
        $sql = "SELECT * FROM {$this->table} WHERE user_id = :user_id ORDER BY created_at DESC LIMIT :limit";
        $stmt = $this->db->prepare($sql);
        $stmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
        $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get logs by entity
     */
    public function getByEntity($entityType, $entityId)
    {
        $sql = "SELECT al.*, u.name as user_display_name
                FROM {$this->table} al
                LEFT JOIN users u ON al.user_id = u.id
                WHERE al.entity_type = :entity_type AND al.entity_id = :entity_id
                ORDER BY al.created_at DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':entity_type' => $entityType,
            ':entity_id' => $entityId
        ]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get logs by date range
     */
    public function getByDateRange($startDate, $endDate, $stationId = null)
    {
        $sql = "SELECT al.*, u.name as user_display_name
                FROM {$this->table} al
                LEFT JOIN users u ON al.user_id = u.id
                WHERE al.created_at BETWEEN :start_date AND :end_date";

        $params = [
            ':start_date' => $startDate . ' 00:00:00',
            ':end_date' => $endDate . ' 23:59:59'
        ];

        if ($stationId) {
            $sql .= " AND (al.station_id = :station_id OR al.station_id IS NULL)";
            $params[':station_id'] = $stationId;
        }

        $sql .= " ORDER BY al.created_at DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get action statistics
     */
    public function getStats($days = 7, $stationId = null)
    {
        $sql = "SELECT action, entity_type, COUNT(*) as count
                FROM {$this->table}
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL :days DAY)";

        $params = [':days' => $days];

        if ($stationId) {
            $sql .= " AND (station_id = :station_id OR station_id IS NULL)";
            $params[':station_id'] = $stationId;
        }

        $sql .= " GROUP BY action, entity_type ORDER BY count DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Clean old logs (for maintenance)
     */
    public function cleanOldLogs($daysToKeep = 90)
    {
        $sql = "DELETE FROM {$this->table} WHERE created_at < DATE_SUB(NOW(), INTERVAL :days DAY)";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([':days' => $daysToKeep]);
    }

    /**
     * Helper: Log login event
     */
    public static function logLogin($userId, $userName)
    {
        $log = new self();
        $log->log($userId, 'login', 'session', null, "تسجيل دخول: {$userName}");
    }

    /**
     * Helper: Log logout event
     */
    public static function logLogout($userId, $userName)
    {
        $log = new self();
        $log->log($userId, 'logout', 'session', null, "تسجيل خروج: {$userName}");
    }
}

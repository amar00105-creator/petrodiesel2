<?php

namespace App\Models;

use App\Config\Database;
use PDO;

class Bank
{
    public function __construct() {}

    public function getAll($stationId = null, $scope = null, $activeOnly = true)
    {
        $db = Database::connect();

        $sql = "SELECT *, bank_name as name FROM banks WHERE 1=1";
        $params = [];

        // Active filter
        if ($activeOnly) {
            $sql .= " AND is_active = 1";
        }

        // Scope filter
        if ($scope === 'local') {
            $sql .= " AND account_scope = 'local'";
        } elseif ($scope === 'global') {
            $sql .= " AND account_scope = 'global'";
        }

        // Station filter (only for local accounts)
        if ($stationId && $stationId !== 'all') {
            $sql .= " AND (account_scope = 'global' OR (account_scope = 'local' AND station_id = ?))";
            $params[] = $stationId;
        }

        $sql .= " ORDER BY account_scope DESC, bank_name ASC";

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get only local banks for a specific station
     */
    public function getLocalByStation($stationId)
    {
        $db = Database::connect();
        $stmt = $db->prepare("SELECT *, bank_name as name FROM banks WHERE account_scope = 'local' AND station_id = ? AND is_active = 1");
        $stmt->execute([$stationId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get only global banks
     */
    public function getGlobal()
    {
        $db = Database::connect();
        return $db->query("SELECT *, bank_name as name FROM banks WHERE account_scope = 'global' AND is_active = 1")->fetchAll(PDO::FETCH_ASSOC);
    }

    public function find($id)
    {
        $db = Database::connect();
        $stmt = $db->prepare("SELECT *, bank_name as name FROM banks WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function updateBalance($id, $amount)
    {
        $db = Database::connect();
        $stmt = $db->prepare("UPDATE banks SET balance = balance + ? WHERE id = ?");
        return $stmt->execute([$amount, $id]);
    }

    public function create($data)
    {
        $db = Database::connect();

        $scope = $data['account_scope'] ?? 'local';
        $stationId = ($scope === 'global') ? null : $data['station_id'];

        $stmt = $db->prepare("INSERT INTO banks (station_id, account_scope, bank_name, account_number, balance, is_active) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $stationId,
            $scope,
            $data['name'],
            $data['account_number'],
            $data['balance'] ?? 0,
            $data['is_active'] ?? 1
        ]);
        return $db->lastInsertId();
    }

    public function update($id, $data)
    {
        $db = Database::connect();

        $scope = $data['account_scope'] ?? 'local';
        $stationId = ($scope === 'global') ? null : ($data['station_id'] ?? null);

        $sql = "UPDATE banks SET bank_name = ?, account_number = ?, account_scope = ?, station_id = ? WHERE id = ?";
        $stmt = $db->prepare($sql);
        return $stmt->execute([$data['name'], $data['account_number'], $scope, $stationId, $id]);
    }

    public function delete($id)
    {
        $db = Database::connect();
        $stmt = $db->prepare("DELETE FROM banks WHERE id = ?");
        return $stmt->execute([$id]);
    }

    /**
     * Set account scope
     */
    public function setScope($id, $scope, $stationId = null)
    {
        $db = Database::connect();
        if ($scope === 'global') {
            $stmt = $db->prepare("UPDATE banks SET account_scope = 'global', station_id = NULL WHERE id = ?");
            return $stmt->execute([$id]);
        } else {
            $stmt = $db->prepare("UPDATE banks SET account_scope = 'local', station_id = ? WHERE id = ?");
            return $stmt->execute([$stationId, $id]);
        }
    }

    /**
     * Toggle active status
     */
    public function toggleActive($id)
    {
        $db = Database::connect();
        $stmt = $db->prepare("UPDATE banks SET is_active = NOT is_active WHERE id = ?");
        return $stmt->execute([$id]);
    }
}

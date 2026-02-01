<?php

namespace App\Models;

use App\Config\Database;
use PDO;

class TransferRequest
{
    public function __construct()
    {
        // No need to cache connection
    }

    /**
     * Generate unique request code
     */
    private function generateRequestCode()
    {
        return 'TRF-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -6));
    }

    /**
     * Create a new transfer request
     * @param array $data - from_type, from_id, to_type, to_id, amount, description, requested_by, station_id
     * @return string|false - request_code on success, false on failure
     */
    public function create($data)
    {
        $db = Database::connect();

        try {
            $db->beginTransaction();

            $requestCode = $this->generateRequestCode();

            $sql = "INSERT INTO transfer_requests 
                    (request_code, from_type, from_id, from_scope, to_type, to_id, to_scope, 
                     amount, description, requested_by, station_id, status) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')";

            $stmt = $db->prepare($sql);
            $stmt->execute([
                $requestCode,
                $data['from_type'],
                $data['from_id'],
                $data['from_scope'],
                $data['to_type'],
                $data['to_id'],
                $data['to_scope'],
                $data['amount'],
                $data['description'] ?? null,
                $data['requested_by'],
                $data['station_id'] ?? null
            ]);

            $db->commit();
            return $requestCode;
        } catch (\Exception $e) {
            $db->rollBack();
            error_log("TransferRequest create error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Find transfer request by code
     */
    public function findByCode($code)
    {
        $db = Database::connect();
        $stmt = $db->prepare("SELECT * FROM transfer_requests WHERE request_code = ?");
        $stmt->execute([$code]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Find transfer request by ID
     */
    public function find($id)
    {
        $db = Database::connect();
        $stmt = $db->prepare("SELECT * FROM transfer_requests WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Get all pending transfer requests
     * @param int|null $stationId - Filter by station if provided
     * @return array
     */
    public function getPending($stationId = null)
    {
        $db = Database::connect();

        if ($stationId) {
            $stmt = $db->prepare("
                SELECT tr.*, 
                       u.name as requester_name,
                       fb.bank_name as from_bank_name,
                       tb.bank_name as to_bank_name
                FROM transfer_requests tr
                LEFT JOIN users u ON tr.requested_by = u.id
                LEFT JOIN banks fb ON tr.from_id = fb.id AND tr.from_type = 'bank'
                LEFT JOIN banks tb ON tr.to_id = tb.id AND tr.to_type = 'bank'
                WHERE tr.status = 'pending' AND tr.station_id = ?
                ORDER BY tr.requested_at DESC
            ");
            $stmt->execute([$stationId]);
        } else {
            $stmt = $db->query("
                SELECT tr.*, 
                       u.name as requester_name,
                       s.name as station_name,
                       fb.bank_name as from_bank_name,
                       fs.name as from_safe_name,
                       tb.bank_name as to_bank_name,
                       ts.name as to_safe_name
                FROM transfer_requests tr
                LEFT JOIN users u ON tr.requested_by = u.id
                LEFT JOIN stations s ON tr.station_id = s.id
                LEFT JOIN banks fb ON tr.from_id = fb.id AND tr.from_type = 'bank'
                LEFT JOIN safes fs ON tr.from_id = fs.id AND tr.from_type = 'safe'
                LEFT JOIN banks tb ON tr.to_id = tb.id AND tr.to_type = 'bank'
                LEFT JOIN safes ts ON tr.to_id = ts.id AND tr.to_type = 'safe'
                WHERE tr.status = 'pending'
                ORDER BY tr.requested_at DESC
            ");
        }

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get all transfer requests (with optional filters)
     */
    public function getAll($filters = [])
    {
        $db = Database::connect();

        $sql = "
            SELECT tr.*, 
                   u.name as requester_name,
                   r.name as reviewer_name,
                   s.name as station_name,
                   fb.bank_name as from_bank_name,
                   fs.name as from_safe_name,
                   tb.bank_name as to_bank_name,
                   ts.name as to_safe_name
            FROM transfer_requests tr
            LEFT JOIN users u ON tr.requested_by = u.id
            LEFT JOIN users r ON tr.reviewed_by = r.id
            LEFT JOIN stations s ON tr.station_id = s.id
            LEFT JOIN banks fb ON tr.from_id = fb.id AND tr.from_type = 'bank'
            LEFT JOIN safes fs ON tr.from_id = fs.id AND tr.from_type = 'safe'
            LEFT JOIN banks tb ON tr.to_id = tb.id AND tr.to_type = 'bank'
            LEFT JOIN safes ts ON tr.to_id = ts.id AND tr.to_type = 'safe'
            WHERE 1=1
        ";

        $params = [];

        if (isset($filters['status'])) {
            $sql .= " AND tr.status = ?";
            $params[] = $filters['status'];
        }

        if (isset($filters['station_id'])) {
            $sql .= " AND tr.station_id = ?";
            $params[] = $filters['station_id'];
        }

        $sql .= " ORDER BY tr.requested_at DESC";

        $stmt = $db->prepare($sql);
        $stmt->execute($params);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Approve a transfer request
     * @param int $id
     * @param int $reviewerId
     * @param int|null $transactionId
     * @param string|null $notes
     */
    public function approve($id, $reviewerId, $transactionId = null, $notes = null)
    {
        $db = Database::connect();

        $sql = "UPDATE transfer_requests 
                SET status = 'approved', 
                    reviewed_by = ?, 
                    reviewed_at = NOW(),
                    transaction_id = ?,
                    review_notes = ?
                WHERE id = ? AND status = 'pending'";

        $stmt = $db->prepare($sql);
        return $stmt->execute([$reviewerId, $transactionId, $notes, $id]);
    }

    /**
     * Reject a transfer request
     */
    public function reject($id, $reviewerId, $notes)
    {
        $db = Database::connect();

        $sql = "UPDATE transfer_requests 
                SET status = 'rejected', 
                    reviewed_by = ?, 
                    reviewed_at = NOW(),
                    review_notes = ?
                WHERE id = ? AND status = 'pending'";

        $stmt = $db->prepare($sql);
        return $stmt->execute([$reviewerId, $notes, $id]);
    }

    /**
     * Cancel a transfer request (by requester before review)
     */
    public function cancel($id, $userId)
    {
        $db = Database::connect();

        $sql = "UPDATE transfer_requests 
                SET status = 'cancelled'
                WHERE id = ? AND requested_by = ? AND status = 'pending'";

        $stmt = $db->prepare($sql);
        return $stmt->execute([$id, $userId]);
    }
}

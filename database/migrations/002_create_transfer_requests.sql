-- Migration: Create Transfer Requests Table
-- File: database/migrations/002_create_transfer_requests.sql
-- Date: 2026-01-30
CREATE TABLE IF NOT EXISTS transfer_requests (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    request_code VARCHAR(50) UNIQUE NOT NULL,
    -- Source Account (Banks only for now)
    from_type ENUM('safe', 'bank') NOT NULL DEFAULT 'bank',
    from_id INT(11) NOT NULL,
    from_scope ENUM('local', 'global') NOT NULL,
    -- Destination Account (Banks only for now)
    to_type ENUM('safe', 'bank') NOT NULL DEFAULT 'bank',
    to_id INT(11) NOT NULL,
    to_scope ENUM('local', 'global') NOT NULL,
    -- Transfer Details
    amount DECIMAL(15, 2) NOT NULL,
    description TEXT,
    -- Status Management
    status ENUM('pending', 'approved', 'rejected', 'cancelled') NOT NULL DEFAULT 'pending',
    -- Audit Trail
    requested_by INT(11) NOT NULL,
    station_id INT(11) NULL COMMENT 'Station of requester',
    requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_by INT(11) NULL,
    reviewed_at TIMESTAMP NULL,
    review_notes TEXT NULL,
    -- Related transaction (once approved)
    transaction_id INT(11) NULL,
    FOREIGN KEY (requested_by) REFERENCES users(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id),
    FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE
    SET NULL,
        INDEX idx_status (status),
        INDEX idx_requested_by (requested_by),
        INDEX idx_station (station_id),
        INDEX idx_created_at (requested_at)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
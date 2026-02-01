-- Migration: Add Multi-Level Support to Safes
-- File: database/migrations/004_add_multi_level_to_safes.sql
-- Date: 2026-01-30
-- Make station_id nullable for global accounts
ALTER TABLE safes
MODIFY COLUMN station_id INT(11) NULL;
-- Add account scope (local or global)
ALTER TABLE safes
ADD COLUMN account_scope ENUM('local', 'global') NOT NULL DEFAULT 'local'
AFTER station_id;
-- Add is_active flag
ALTER TABLE safes
ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1
AFTER balance;
-- Add indexes for performance
ALTER TABLE safes
ADD INDEX idx_scope_station (account_scope, station_id);
ALTER TABLE safes
ADD INDEX idx_active (is_active);
-- Update existing records to be 'local' scope
UPDATE safes
SET account_scope = 'local'
WHERE account_scope IS NULL
    OR account_scope = 'local';
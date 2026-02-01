-- Migration: Add Multi-Level Support to Banks
-- File: database/migrations/001_add_multi_level_to_banks.sql
-- Date: 2026-01-30
-- Make station_id nullable for global accounts
ALTER TABLE banks
MODIFY COLUMN station_id INT(11) NULL;
-- Add account scope (local or global)
ALTER TABLE banks
ADD COLUMN account_scope ENUM('local', 'global') NOT NULL DEFAULT 'local'
AFTER station_id;
-- Add is_active flag
ALTER TABLE banks
ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1
AFTER balance;
-- Add indexes for performance
ALTER TABLE banks
ADD INDEX idx_scope_station (account_scope, station_id);
ALTER TABLE banks
ADD INDEX idx_active (is_active);
-- Update existing records to be 'local' scope
UPDATE banks
SET account_scope = 'local'
WHERE account_scope IS NULL
    OR account_scope = 'local';
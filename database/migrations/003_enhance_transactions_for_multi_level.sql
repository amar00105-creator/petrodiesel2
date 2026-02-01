-- Migration: Enhance Transactions for Multi-Level
-- File: database/migrations/003_enhance_transactions_for_multi_level.sql
-- Date: 2026-01-30
-- Add transfer_request_id to link back to approval process
ALTER TABLE transactions
ADD COLUMN transfer_request_id INT(11) NULL
AFTER id;
-- Add scope tracking for from/to accounts
ALTER TABLE transactions
ADD COLUMN from_scope ENUM('local', 'global') NULL
AFTER from_id;
ALTER TABLE transactions
ADD COLUMN to_scope ENUM('local', 'global') NULL
AFTER to_id;
-- Add index
ALTER TABLE transactions
ADD INDEX idx_transfer_request (transfer_request_id);
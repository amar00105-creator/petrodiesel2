-- Add tank update tracking fields to calibration_logs table
-- This allows tracking when calibration readings update the tank volume directly
-- Add column to track if tank was updated from this calibration
ALTER TABLE calibration_logs
ADD COLUMN IF NOT EXISTS tank_updated BOOLEAN DEFAULT FALSE COMMENT 'Whether this calibration updated the tank volume directly';
-- Add column to store previous tank volume before update
ALTER TABLE calibration_logs
ADD COLUMN IF NOT EXISTS previous_volume DECIMAL(10, 2) DEFAULT NULL COMMENT 'Tank volume before this calibration update (if updated)';
-- Add index for faster queries on tank_updated
CREATE INDEX IF NOT EXISTS idx_calibration_logs_tank_updated ON calibration_logs(tank_updated);
-- Migration: Update calibration_tables to use millimeters instead of centimeters
-- This script updates the existing calibration_tables schema
-- Step 1: Rename column from reading_cm to height_mm
ALTER TABLE calibration_tables CHANGE COLUMN reading_cm height_mm DECIMAL(10, 2) NOT NULL COMMENT 'Height in millimeters';
-- Step 2: Convert existing data from centimeters to millimeters
-- (multiply by 10)
UPDATE calibration_tables
SET height_mm = height_mm * 10;
-- Step 3: Add index for performance optimization
CREATE INDEX IF NOT EXISTS idx_tank_height ON calibration_tables(tank_id, height_mm);
-- Step 4: Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_tank_id ON calibration_tables(tank_id);
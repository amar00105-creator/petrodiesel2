-- Migration: Make suppliers global (remove station_id)
-- This allows one supplier to serve multiple stations with unified account
-- Backup current data first (just in case)
-- You can run: mysqldump petrodiesel_db suppliers > suppliers_backup.sql
-- Step 1: Drop the foreign key constraint
ALTER TABLE `suppliers` DROP FOREIGN KEY `suppliers_ibfk_1`;
-- Step 2: Remove the station_id column
ALTER TABLE `suppliers` DROP COLUMN `station_id`;
-- Optional: If you have duplicate suppliers across stations that should be merged,
-- you'll need to:
-- 1. Identify duplicates: SELECT name, phone, COUNT(*) FROM suppliers GROUP BY name, phone HAVING COUNT(*) > 1;
-- 2. Manually merge them by updating the supplier_id in purchases table
-- 3. Delete the duplicate suppliers
-- Note: After this migration:
-- - Suppliers are now system-wide (no station association)
-- - Each supplier has ONE unified balance across all stations
-- - The purchases table still tracks which station bought from which supplier
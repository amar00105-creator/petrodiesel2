-- Performance Indexes for PETRODIESEL2
-- Run this migration to improve query performance
-- Sales table indexes
CREATE INDEX IF NOT EXISTS idx_sales_station_date ON sales(station_id, sale_date);
CREATE INDEX IF NOT EXISTS idx_sales_customer ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_worker ON sales(worker_id);
CREATE INDEX IF NOT EXISTS idx_sales_counter ON sales(counter_id);
-- Transactions table indexes
CREATE INDEX IF NOT EXISTS idx_transactions_station_type ON transactions(station_id, type);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_related ON transactions(related_entity_type, related_entity_id);
-- Purchases table indexes
CREATE INDEX IF NOT EXISTS idx_purchases_supplier ON purchases(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchases_station ON purchases(station_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(status);
-- Customers table indexes
CREATE INDEX IF NOT EXISTS idx_customers_station ON customers(station_id);
-- Tanks table indexes
CREATE INDEX IF NOT EXISTS idx_tanks_station ON tanks(station_id);
-- Counters table indexes
CREATE INDEX IF NOT EXISTS idx_counters_pump ON counters(pump_id);
-- Tank readings/calibrations indexes
CREATE INDEX IF NOT EXISTS idx_tank_calibrations_tank ON tank_calibrations(tank_id);
-- Make suppliers global (remove station_id requirement)
ALTER TABLE suppliers
MODIFY COLUMN station_id INT NULL;
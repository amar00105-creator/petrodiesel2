-- PetroDiesel ERP Database Schema

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Stations Table
CREATE TABLE IF NOT EXISTS `stations` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `address` TEXT,
    `phone` VARCHAR(50),
    `logo_url` VARCHAR(255),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Users Table (Multi-tenant support via station_id)
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `station_id` INT NULL, -- NULL for Super Admin
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255),
    `google_id` VARCHAR(255),
    `role` ENUM('super_admin', 'admin', 'manager', 'accountant', 'viewer') DEFAULT 'viewer',
    `status` ENUM('active', 'inactive') DEFAULT 'active',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`station_id`) REFERENCES `stations`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Workers Table
CREATE TABLE IF NOT EXISTS `workers` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `station_id` INT NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(50),
    `national_id` VARCHAR(50),
    `status` ENUM('active', 'inactive') DEFAULT 'active',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`station_id`) REFERENCES `stations`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Tanks Table
CREATE TABLE IF NOT EXISTS `tanks` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `station_id` INT NOT NULL,
    `name` VARCHAR(100) NOT NULL COMMENT 'e.g. Diesel Tank 1',
    `product_type` ENUM('Petrol', 'Diesel', 'Gas', 'Oil') NOT NULL,
    `capacity_liters` DECIMAL(10, 2) NOT NULL,
    `current_volume` DECIMAL(10, 2) DEFAULT 0.00,
    `current_price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT 'Current selling price per liter',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`station_id`) REFERENCES `stations`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Calibration Tables (Dipstick Chart)
CREATE TABLE IF NOT EXISTS `calibration_tables` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `tank_id` INT NOT NULL,
    `reading_cm` DECIMAL(10, 2) NOT NULL,
    `volume_liters` DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (`tank_id`) REFERENCES `tanks`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Tank Readings (Daily Stock Take)
CREATE TABLE IF NOT EXISTS `tank_readings` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `tank_id` INT NOT NULL,
    `user_id` INT NOT NULL COMMENT 'Who recorded it',
    `reading_cm` DECIMAL(10, 2) NOT NULL,
    `volume_liters` DECIMAL(10, 2) NOT NULL,
    `reading_type` ENUM('opening', 'closing', 'delivery', 'check') DEFAULT 'closing',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`tank_id`) REFERENCES `tanks`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Pumps
CREATE TABLE IF NOT EXISTS `pumps` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `station_id` INT NOT NULL,
    `tank_id` INT NOT NULL COMMENT 'Source Tank',
    `name` VARCHAR(100) NOT NULL COMMENT 'e.g. Pump 1',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`station_id`) REFERENCES `stations`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`tank_id`) REFERENCES `tanks`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Counters (Nozzles)
CREATE TABLE IF NOT EXISTS `counters` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `pump_id` INT NOT NULL,
    `name` VARCHAR(50) NOT NULL COMMENT 'e.g. Nozzle A',
    `current_reading` DECIMAL(15, 2) DEFAULT 0.00,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`pump_id`) REFERENCES `pumps`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Suppliers
CREATE TABLE IF NOT EXISTS `suppliers` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `station_id` INT NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(50),
    `balance` DECIMAL(15, 2) DEFAULT 0.00 COMMENT 'Positive = We owe them',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`station_id`) REFERENCES `stations`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Customers (Debtors)
CREATE TABLE IF NOT EXISTS `customers` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `station_id` INT NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(50),
    `balance` DECIMAL(15, 2) DEFAULT 0.00 COMMENT 'Positive = They owe us',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`station_id`) REFERENCES `stations`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Sales (Transactions)
CREATE TABLE IF NOT EXISTS `sales` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `station_id` INT NOT NULL,
    `counter_id` INT NOT NULL,
    `worker_id` INT NULL COMMENT 'Worker assigned to this shift',
    `user_id` INT NOT NULL COMMENT 'User who entered the record',
    `opening_reading` DECIMAL(15, 2) NOT NULL,
    `closing_reading` DECIMAL(15, 2) NOT NULL,
    `volume_sold` DECIMAL(10, 2) NOT NULL,
    `unit_price` DECIMAL(10, 2) NOT NULL,
    `total_amount` DECIMAL(15, 2) NOT NULL,
    `payment_method` ENUM('cash', 'credit') DEFAULT 'cash',
    `customer_id` INT NULL COMMENT 'If credit',
    `shift` ENUM('Morning', 'Evening', 'Night') DEFAULT 'Morning',
    `sale_date` DATE NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`station_id`) REFERENCES `stations`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`counter_id`) REFERENCES `counters`(`id`),
    FOREIGN KEY (`worker_id`) REFERENCES `workers`(`id`),
    FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Purchases (Stock In)
CREATE TABLE IF NOT EXISTS `purchases` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `station_id` INT NOT NULL,
    `supplier_id` INT NOT NULL,
    `tank_id` INT NOT NULL COMMENT 'Destination Tank',
    `truck_number` VARCHAR(50),
    `driver_name` VARCHAR(100),
    `invoice_number` VARCHAR(50),
    `volume_ordered` DECIMAL(10, 2) NOT NULL,
    `volume_received` DECIMAL(10, 2) NOT NULL,
    `price_per_liter` DECIMAL(10, 2) NOT NULL,
    `total_cost` DECIMAL(15, 2) NOT NULL,
    `paid_amount` DECIMAL(15, 2) DEFAULT 0.00,
    `status` ENUM('ordered', 'in_transit', 'arrived', 'offloading', 'completed') DEFAULT 'ordered',
    `invoice_image` VARCHAR(255),
    `delivery_note_image` VARCHAR(255),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`station_id`) REFERENCES `stations`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`tank_id`) REFERENCES `tanks`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12.1. Drivers Table
CREATE TABLE IF NOT EXISTS `drivers` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `truck_number` VARCHAR(50) NOT NULL,
    `phone` VARCHAR(50),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Alter Purchases to add driver_id if not exists (using a safe way or just documenting it for clean install)
-- Since this is a schema file, we'll just define the structure. 
-- In a real migration we'd use ALTER, but since I'm editing the schema file I'll update the CREATE TABLE for purchases if I could, but I'm appending or replacing.
-- Let's replace the Purchases table definition to include driver_id and payment info.

DROP TABLE IF EXISTS `purchases`;
CREATE TABLE IF NOT EXISTS `purchases` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `station_id` INT NOT NULL,
    `supplier_id` INT NOT NULL,
    `tank_id` INT NOT NULL COMMENT 'Destination Tank',
    `driver_id` INT NULL, 
    `truck_number` VARCHAR(50), -- Kept for historical or fallback
    `driver_name` VARCHAR(100), -- Kept for historical or fallback
    `invoice_number` VARCHAR(50),
    `volume_ordered` DECIMAL(10, 2) NOT NULL,
    `volume_received` DECIMAL(10, 2) NOT NULL,
    `price_per_liter` DECIMAL(10, 2) NOT NULL,
    `total_cost` DECIMAL(15, 2) NOT NULL,
    `paid_amount` DECIMAL(15, 2) DEFAULT 0.00,
    `payment_source_type` ENUM('safe', 'bank') NULL,
    `payment_source_id` INT NULL, 
    `status` ENUM('ordered', 'in_transit', 'arrived', 'offloading', 'completed') DEFAULT 'ordered',
    `invoice_image` VARCHAR(255),
    `delivery_note_image` VARCHAR(255),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`station_id`) REFERENCES `stations`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`),
    FOREIGN KEY (`tank_id`) REFERENCES `tanks`(`id`),
    FOREIGN KEY (`driver_id`) REFERENCES `drivers`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Safes (Treasury)
CREATE TABLE IF NOT EXISTS `safes` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `station_id` INT NOT NULL,
    `name` VARCHAR(100) NOT NULL COMMENT 'Main Safe, Office Safe...',
    `balance` DECIMAL(15, 2) DEFAULT 0.00,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`station_id`) REFERENCES `stations`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. Banks
CREATE TABLE IF NOT EXISTS `banks` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `station_id` INT NOT NULL,
    `bank_name` VARCHAR(100) NOT NULL,
    `account_number` VARCHAR(50),
    `balance` DECIMAL(15, 2) DEFAULT 0.00,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`station_id`) REFERENCES `stations`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. Expenses
CREATE TABLE IF NOT EXISTS `expenses` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `station_id` INT NOT NULL,
    `category` VARCHAR(100) NOT NULL COMMENT 'Salaries, Electricity, etc.',
    `description` TEXT,
    `amount` DECIMAL(15, 2) NOT NULL,
    `user_id` INT NOT NULL,
    `source_type` ENUM('safe', 'bank') NOT NULL,
    `source_id` INT NOT NULL COMMENT 'ID of Safe or Bank',
    `expense_date` DATE NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`station_id`) REFERENCES `stations`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

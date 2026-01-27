-- 1. Create fuel_types table
CREATE TABLE IF NOT EXISTS `fuel_types` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(50) NOT NULL,
    `code` VARCHAR(50) NOT NULL UNIQUE,
    `color_hex` VARCHAR(20) DEFAULT '#64748b',
    `price_per_liter` DECIMAL(10, 2) DEFAULT 0.00,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- 2. Insert Default Data (match existing ENUM keys)
INSERT INTO `fuel_types` (`name`, `code`, `color_hex`)
VALUES ('Diesel', 'diesel', '#f59e0b'),
    -- Amber (Diesel)
    ('Petrol 91', 'petrol_91', '#10b981'),
    -- Emerald
    ('Petrol 95', 'petrol_95', '#3b82f6'),
    -- Blue
    ('Gas', 'gas', '#f97316'),
    -- Orange
    ('Oil', 'oil', '#64748b') -- Slate
    ON DUPLICATE KEY
UPDATE name =
VALUES(name);
-- 3. Modify tanks table
-- Add the new column
ALTER TABLE `tanks`
ADD COLUMN `fuel_type_id` INT NULL
AFTER `station_id`;
-- 4. Migrate Data
UPDATE `tanks`
SET `fuel_type_id` = (
        SELECT `id`
        FROM `fuel_types`
        WHERE `code` = 'diesel'
    )
WHERE `product_type` = 'Diesel';
UPDATE `tanks`
SET `fuel_type_id` = (
        SELECT `id`
        FROM `fuel_types`
        WHERE `code` = 'petrol_91'
    )
WHERE `product_type` = 'Petrol'
    OR `product_type` = 'Petrol 91';
-- Note: 'Petrol' in enum likely mapped to 91 or 95 based on context, defaulting to 91 for safety or checking if 'Petrol 95' was an option. 
-- The Schema said ENUM('Petrol', 'Diesel', 'Gas', 'Oil'). Let's assume 'Petrol' -> Petrol 91.
UPDATE `tanks`
SET `fuel_type_id` = (
        SELECT `id`
        FROM `fuel_types`
        WHERE `code` = 'gas'
    )
WHERE `product_type` = 'Gas';
UPDATE `tanks`
SET `fuel_type_id` = (
        SELECT `id`
        FROM `fuel_types`
        WHERE `code` = 'oil'
    )
WHERE `product_type` = 'Oil';
-- 5. Drop old column 
ALTER TABLE `tanks` DROP COLUMN `product_type`;
-- 6. Add Foreign Key
ALTER TABLE `tanks`
ADD CONSTRAINT `fk_tanks_fuel_type` FOREIGN KEY (`fuel_type_id`) REFERENCES `fuel_types`(`id`) ON DELETE CASCADE;
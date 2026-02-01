CREATE TABLE IF NOT EXISTS `transaction_categories` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `type` ENUM('income', 'expense') NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- Insert default categories
INSERT INTO `transaction_categories` (`name`, `type`)
VALUES ('Sales', 'income'),
    ('Refund', 'expense'),
    ('Salary', 'expense'),
    ('Maintenance', 'expense'),
    ('Utilities', 'expense'),
    ('Rent', 'expense'),
    ('Other', 'expense');
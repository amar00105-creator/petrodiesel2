-- Add role_id to users table if it doesn't exist
SET @dbname = DATABASE();
SET @tablename = "users";
SET @columnname = "role_id";
SET @preparedStatement = (
        SELECT IF(
                (
                    SELECT COUNT(*)
                    FROM INFORMATION_SCHEMA.COLUMNS
                    WHERE (table_name = @tablename)
                        AND (table_schema = @dbname)
                        AND (column_name = @columnname)
                ) > 0,
                "SELECT 1",
                "ALTER TABLE users ADD COLUMN role_id INT NULL AFTER role;"
            )
    );
PREPARE alterIfNotExists
FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;
-- Ensure roles table exists (re-affirming structure)
CREATE TABLE IF NOT EXISTS `roles` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(50) NOT NULL UNIQUE,
    `description` VARCHAR(255),
    `permissions` JSON,
    `is_system` BOOLEAN DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- Add foreign key if not exists
SET @preparedStatementFK = (
        SELECT IF(
                (
                    SELECT COUNT(*)
                    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
                    WHERE (table_name = 'users')
                        AND (constraint_name = 'fk_users_role_id')
                        AND (table_schema = @dbname)
                ) > 0,
                "SELECT 1",
                "ALTER TABLE users ADD CONSTRAINT fk_users_role_id FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL;"
            )
    );
PREPARE addFKIfNotExists
FROM @preparedStatementFK;
EXECUTE addFKIfNotExists;
DEALLOCATE PREPARE addFKIfNotExists;
-- Insert default roles if table is empty
INSERT INTO `roles` (
        `name`,
        `description`,
        `permissions`,
        `is_system`
    )
SELECT *
FROM (
        SELECT 'Super Admin',
            'Full Access',
            '["*"]',
            1
    ) AS tmp
WHERE NOT EXISTS (
        SELECT name
        FROM roles
        WHERE name = 'Super Admin'
    )
LIMIT 1;
INSERT INTO `roles` (
        `name`,
        `description`,
        `permissions`,
        `is_system`
    )
SELECT *
FROM (
        SELECT 'Manager',
            'Station Manager',
            '["sales.view", "sales.create", "sales.edit", "purchases.view", "purchases.create", "inventory.view"]',
            0
    ) AS tmp
WHERE NOT EXISTS (
        SELECT name
        FROM roles
        WHERE name = 'Manager'
    )
LIMIT 1;
INSERT INTO `roles` (
        `name`,
        `description`,
        `permissions`,
        `is_system`
    )
SELECT *
FROM (
        SELECT 'Accountant',
            'Finance Access',
            '["finance.view", "finance.create", "expenses.view", "expenses.create"]',
            0
    ) AS tmp
WHERE NOT EXISTS (
        SELECT name
        FROM roles
        WHERE name = 'Accountant'
    )
LIMIT 1;
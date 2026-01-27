-- Add last_activity column to users table
ALTER TABLE users
ADD COLUMN last_activity TIMESTAMP NULL DEFAULT NULL
AFTER status;
-- Update existing active users with current timestamp
UPDATE users
SET last_activity = CURRENT_TIMESTAMP
WHERE status = 'active';
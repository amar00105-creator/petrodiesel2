-- Add timezone setting if not exists
INSERT INTO `settings` (
        `station_id`,
        `section`,
        `key_name`,
        `value`,
        `type`
    )
VALUES (
        NULL,
        'general',
        'timezone',
        'Africa/Khartoum',
        'string'
    ) ON DUPLICATE KEY
UPDATE `key_name` = `key_name`;
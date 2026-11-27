ALTER TABLE subscribers ADD COLUMN notification_types INTEGER NOT NULL DEFAULT 1 CHECK(notification_types BETWEEN 1 AND 15);

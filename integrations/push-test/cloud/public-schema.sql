CREATE TABLE IF NOT EXISTS request_limits(id TEXT PRIMARY KEY,count INTEGER NOT NULL,expires_at INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS request_limits_expiry ON request_limits(expires_at);
CREATE INDEX IF NOT EXISTS subscribers_daily ON subscribers(daily,expired,daily_time);

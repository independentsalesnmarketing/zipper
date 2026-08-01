-- Storage behind the /api/broadband spend limits.
--
-- Each table is a set of counters that are incremented with a single atomic
-- statement, so concurrent requests during a crawl cannot race past a ceiling.

-- Credits consumed per window. One row per window: 'day:2026-08-01', 'month:2026-08'.
CREATE TABLE IF NOT EXISTS broadband_credit_usage (
  period_key TEXT PRIMARY KEY,
  credits    INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fresh lookups per client per window. The key holds a salted hash of the IP,
-- never the address itself. Rows are disposable and pruned once expired.
CREATE TABLE IF NOT EXISTS broadband_rate_limit (
  bucket_key TEXT PRIMARY KEY,
  hits       INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS broadband_rate_limit_expires_at_idx
  ON broadband_rate_limit (expires_at);

-- Daily tally of how each request ended (cache hit, upstream call, or which
-- guard turned it away). Aggregated rather than one row per request so a flood
-- cannot grow the table.
CREATE TABLE IF NOT EXISTS broadband_event_counts (
  day        DATE NOT NULL,
  event      TEXT NOT NULL,
  count      INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (day, event)
);

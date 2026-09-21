-- PostgreSQL Database Schema for Marketing Dashboard

CREATE TABLE IF NOT EXISTS campaigns (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    platform VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    budget NUMERIC(10, 2) NOT NULL,
    target_cpa NUMERIC(10, 2)
);

CREATE TABLE IF NOT EXISTS daily_metrics (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER REFERENCES campaigns(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    spend NUMERIC(10, 2) NOT NULL,
    revenue NUMERIC(10, 2) NOT NULL,
    impressions INTEGER,
    clicks INTEGER,
    conversions INTEGER
);

-- Indexes for optimized time-series and analytical queries
CREATE INDEX IF NOT EXISTS idx_campaign_platform ON campaigns(platform);
CREATE INDEX IF NOT EXISTS idx_daily_metrics_date ON daily_metrics(date);
CREATE INDEX IF NOT EXISTS idx_daily_metrics_campaign_id ON daily_metrics(campaign_id);


-- Per-microservice schemas on shared RDS (run once before ECS cutover)
CREATE SCHEMA IF NOT EXISTS catalog;
CREATE SCHEMA IF NOT EXISTS orders;
CREATE SCHEMA IF NOT EXISTS notification;

COMMENT ON SCHEMA catalog IS 'revogue-catalog service';
COMMENT ON SCHEMA orders IS 'revogue-order service';
COMMENT ON SCHEMA notification IS 'revogue-notification service';

-- 009_bus_optin.sql
-- Simplified transport enrolment model:
-- if a student opts into bus service, store assignment + add one transport fee record for the active session

ALTER TABLE student_transport
  ADD COLUMN IF NOT EXISTS is_active TINYINT(1) DEFAULT 1 AFTER pickup_type,
  ADD COLUMN IF NOT EXISTS opted_in_date DATE DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS opted_out_date DATE DEFAULT NULL;

-- Ensure a "Transport" fee category exists
INSERT IGNORE INTO fee_categories (name, description, is_active)
VALUES ('Transport', 'Optional school transport service fee', 1);
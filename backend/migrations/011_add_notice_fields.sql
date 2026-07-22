-- 011_add_notice_fields.sql
-- Add type (global vs work) and target_role columns to notices table

ALTER TABLE notices ADD COLUMN type ENUM('global', 'work') DEFAULT 'global';
ALTER TABLE notices ADD COLUMN target_role VARCHAR(50) NULL;

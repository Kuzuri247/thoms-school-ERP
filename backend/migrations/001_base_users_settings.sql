-- Safe: uses IF NOT EXISTS and ALTER + ADD COLUMN IF NOT EXISTS

CREATE TABLE IF NOT EXISTS `settings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `setting_key` VARCHAR(100) NOT NULL UNIQUE,
  `setting_value` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

ALTER TABLE `users`
  ADD COLUMN IF NOT EXISTS `full_name` VARCHAR(255) DEFAULT NULL AFTER `email`,
  ADD COLUMN IF NOT EXISTS `phone` VARCHAR(20) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `class` VARCHAR(50) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `section` VARCHAR(10) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `status` ENUM('active','inactive','suspended') DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS `last_login` TIMESTAMP NULL,
  ADD COLUMN IF NOT EXISTS `refresh_token_hash` VARCHAR(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

ALTER TABLE `users`
  MODIFY COLUMN `role` ENUM(
    'super_admin','admin','principal','vp',
    'receptionist','cashier','teacher','busstaff','student'
  ) NOT NULL DEFAULT 'student';

CREATE TABLE IF NOT EXISTS `webhook_events` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `event_id` VARCHAR(255) NOT NULL UNIQUE,
  `event_type` VARCHAR(100) NOT NULL,
  `processed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_event_id` (`event_id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT DEFAULT NULL,
  `action` VARCHAR(100) NOT NULL,
  `entity_type` VARCHAR(50) DEFAULT NULL,
  `entity_id` INT DEFAULT NULL,
  `old_data` JSON DEFAULT NULL,
  `new_data` JSON DEFAULT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `user_agent` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_action` (`action`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB;
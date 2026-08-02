-- Migration 015: Communication Templates & Logs Tables for WhatsApp Desk

CREATE TABLE IF NOT EXISTS `communication_templates` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) DEFAULT 'General',
  `channel` VARCHAR(50) DEFAULT 'WhatsApp',
  `subject` VARCHAR(255) DEFAULT NULL,
  `body` TEXT NOT NULL,
  `created_by` INT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `idx_comm_tpl_channel` (`channel`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `communication_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `channel` VARCHAR(50) DEFAULT 'WhatsApp',
  `recipient_group` VARCHAR(255) NOT NULL,
  `subject` VARCHAR(255) DEFAULT NULL,
  `message_body` TEXT NOT NULL,
  `sender_id` INT DEFAULT NULL,
  `sender_name` VARCHAR(255) NOT NULL,
  `scheduled_time` DATETIME DEFAULT NULL,
  `status` ENUM('Sent', 'Delivered', 'Scheduled') DEFAULT 'Sent',
  `recipient_count` INT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `idx_comm_log_channel` (`channel`)
) ENGINE=InnoDB;

-- Seed Default WhatsApp Templates for Exams, Holidays, and Celebrations
INSERT INTO `communication_templates` (`title`, `category`, `channel`, `subject`, `body`)
SELECT 'Upcoming Examination Schedule & Guidelines', 'Exams', 'WhatsApp', 'Important: Examination Datesheet & Guidelines', 'Dear Parent/Student, Please note that the upcoming examinations for Class {Class_Name} will commence on {Start_Date}. The detailed datesheet and syllabus instructions have been uploaded to the student portal. Please ensure your ward arrives by 08:30 AM in full school uniform.'
WHERE NOT EXISTS (SELECT 1 FROM `communication_templates` WHERE `title` = 'Upcoming Examination Schedule & Guidelines');

INSERT INTO `communication_templates` (`title`, `category`, `channel`, `subject`, `body`)
SELECT 'Official School Holiday Notice', 'Announcements', 'WhatsApp', 'Official Declaration of School Holiday', 'Dear Parents & Students, Please be informed that St. Thomas International School will remain CLOSED on {Date} on account of {Reason}. Regular classes and school transport services will resume on {Next_Working_Day}.'
WHERE NOT EXISTS (SELECT 1 FROM `communication_templates` WHERE `title` = 'Official School Holiday Notice');

INSERT INTO `communication_templates` (`title`, `category`, `channel`, `subject`, `body`)
SELECT 'School Celebration & Event Invitation', 'Events & Celebrations', 'WhatsApp', 'Cordially Invited: Annual School Celebration & Event', 'Respected Parents & Dear Students, We are delighted to invite you to our upcoming {Event_Name} scheduled on {Date} at {Time} in the Main School Auditorium. Join us in celebrating our students performance and achievements!'
WHERE NOT EXISTS (SELECT 1 FROM `communication_templates` WHERE `title` = 'School Celebration & Event Invitation');

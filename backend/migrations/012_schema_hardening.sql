-- Migration 012: Comprehensive Schema Hardening, ENUM Normalization, Indexes & Foreign Keys
-- 
-- Design Decision for Notifications Table:
-- Standalone per-user content & alert tracker to support non-notice system alerts
-- (e.g. fee confirmations, homework deadlines, attendance alerts) alongside notice-derived alerts.

-- 1. Migrate & Narrow `users.role` ENUM
UPDATE `users` SET `role` = 'admin' WHERE `role` IN ('principal', 'vp', 'receptionist');
ALTER TABLE `users` MODIFY COLUMN `role` ENUM('super_admin', 'admin', 'cashier', 'teacher', 'busstaff', 'student') NOT NULL DEFAULT 'student';

-- 2. Migrate & Narrow `exams.exam_type` ENUM
-- Mapping: unit_test -> internal_1, mid_term/practical -> internal_2, final -> semester
UPDATE `exams` SET `exam_type` = 'internal_1' WHERE `exam_type` = 'unit_test';
UPDATE `exams` SET `exam_type` = 'internal_2' WHERE `exam_type` IN ('mid_term', 'practical');
UPDATE `exams` SET `exam_type` = 'semester' WHERE `exam_type` = 'final';
ALTER TABLE `exams` MODIFY COLUMN `exam_type` ENUM('internal_1', 'internal_2', 'semester') NOT NULL DEFAULT 'internal_1';

-- 3. Sanity Check & Align `exams.half_year` based on start_date month (Months Oct-Mar = H2, Apr-Sep = H1)
UPDATE `exams` SET `half_year` = 'H2' WHERE `start_date` IS NOT NULL AND MONTH(`start_date`) IN (10, 11, 12, 1, 2, 3);
UPDATE `exams` SET `half_year` = 'H1' WHERE `start_date` IS NOT NULL AND MONTH(`start_date`) IN (4, 5, 6, 7, 8, 9);

-- 4. Scope `exam_weightage` with class_id (0 = sentinel for all classes / school-wide default)
ALTER TABLE `exam_weightage` ADD COLUMN `class_id` INT NOT NULL DEFAULT 0 AFTER `session_id`;
UPDATE `exam_weightage` SET `class_id` = 0 WHERE `class_id` IS NULL;
ALTER TABLE `exam_weightage` ADD INDEX `idx_ew_session` (`session_id`);
ALTER TABLE `exam_weightage` DROP INDEX `uk_session_half`;
ALTER TABLE `exam_weightage` ADD UNIQUE KEY `uk_session_class_half` (`session_id`, `class_id`, `half_year`);

-- 5. Consolidate `notices` targeting columns (target_section_id ON DELETE SET NULL)
ALTER TABLE `notices` ADD COLUMN `target_section_id` INT DEFAULT NULL AFTER `target_role`;
ALTER TABLE `notices` ADD CONSTRAINT `fk_notices_target_section` FOREIGN KEY (`target_section_id`) REFERENCES `sections`(`id`) ON DELETE SET NULL;

-- 6. Create standalone notifications tracking table
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `type` ENUM('notice','homework','attendance','fee','system') DEFAULT 'system',
  `is_read` TINYINT(1) DEFAULT 0,
  `link_url` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_notifications_user_read` (`user_id`, `is_read`),
  INDEX `idx_notifications_created` (`created_at`)
) ENGINE=InnoDB;

-- 7. Add Explicit ON DELETE Safety Rules for Foreign Keys
ALTER TABLE `attendance` MODIFY COLUMN `marked_by` INT DEFAULT NULL COMMENT 'teacher user_id';
ALTER TABLE `attendance` ADD CONSTRAINT `fk_attendance_marked_by` FOREIGN KEY (`marked_by`) REFERENCES `users`(`id`) ON DELETE SET NULL;

ALTER TABLE `homework` MODIFY COLUMN `assigned_by` INT DEFAULT NULL COMMENT 'teacher user_id';
ALTER TABLE `homework` ADD CONSTRAINT `fk_homework_assigned_by` FOREIGN KEY (`assigned_by`) REFERENCES `users`(`id`) ON DELETE SET NULL;

ALTER TABLE `timetables` MODIFY COLUMN `teacher_user_id` INT DEFAULT NULL;
ALTER TABLE `timetables` ADD CONSTRAINT `fk_timetables_teacher` FOREIGN KEY (`teacher_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL;

ALTER TABLE `marks` MODIFY COLUMN `entered_by` INT DEFAULT NULL COMMENT 'teacher user_id';
ALTER TABLE `marks` ADD CONSTRAINT `fk_marks_entered_by` FOREIGN KEY (`entered_by`) REFERENCES `users`(`id`) ON DELETE SET NULL;

ALTER TABLE `receipts` ADD CONSTRAINT `fk_receipts_student` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE RESTRICT;

ALTER TABLE `homework_submissions` MODIFY COLUMN `marked_by` INT DEFAULT NULL COMMENT 'teacher user_id';
ALTER TABLE `homework_submissions` ADD CONSTRAINT `fk_homework_submissions_marked_by` FOREIGN KEY (`marked_by`) REFERENCES `users`(`id`) ON DELETE SET NULL;

ALTER TABLE `student_transport` ADD CONSTRAINT `fk_student_transport_session` FOREIGN KEY (`session_id`) REFERENCES `academic_sessions`(`id`) ON DELETE CASCADE;

ALTER TABLE `refunds` MODIFY COLUMN `initiated_by` INT DEFAULT NULL;
ALTER TABLE `refunds` ADD CONSTRAINT `fk_refunds_initiated_by` FOREIGN KEY (`initiated_by`) REFERENCES `users`(`id`) ON DELETE SET NULL;

-- 8. Razorpay Payment Integrity Foreign Keys with Backup Table Preservation
CREATE TABLE IF NOT EXISTS `_orphaned_rp_payments_backup` AS 
SELECT * FROM `razorpay_payments` WHERE `razorpay_order_id` NOT IN (SELECT `razorpay_order_id` FROM `razorpay_orders`);
DELETE FROM `razorpay_payments` WHERE `razorpay_order_id` NOT IN (SELECT `razorpay_order_id` FROM `razorpay_orders`);

ALTER TABLE `razorpay_payments` ADD CONSTRAINT `fk_rp_payments_order` FOREIGN KEY (`razorpay_order_id`) REFERENCES `razorpay_orders`(`razorpay_order_id`) ON DELETE RESTRICT;

CREATE TABLE IF NOT EXISTS `_orphaned_receipts_backup` AS 
SELECT * FROM `receipts` WHERE `razorpay_payment_id` IS NOT NULL AND `razorpay_payment_id` NOT IN (SELECT `razorpay_payment_id` FROM `razorpay_payments`);
DELETE FROM `receipts` WHERE `razorpay_payment_id` IS NOT NULL AND `razorpay_payment_id` NOT IN (SELECT `razorpay_payment_id` FROM `razorpay_payments`);

CREATE TABLE IF NOT EXISTS `_orphaned_refunds_backup` AS 
SELECT * FROM `refunds` WHERE `razorpay_payment_id` IS NOT NULL AND `razorpay_payment_id` NOT IN (SELECT `razorpay_payment_id` FROM `razorpay_payments`);
DELETE FROM `refunds` WHERE `razorpay_payment_id` IS NOT NULL AND `razorpay_payment_id` NOT IN (SELECT `razorpay_payment_id` FROM `razorpay_payments`);

ALTER TABLE `receipts` ADD CONSTRAINT `fk_receipts_payment` FOREIGN KEY (`razorpay_payment_id`) REFERENCES `razorpay_payments`(`razorpay_payment_id`) ON DELETE RESTRICT;
ALTER TABLE `refunds` ADD CONSTRAINT `fk_refunds_payment` FOREIGN KEY (`razorpay_payment_id`) REFERENCES `razorpay_payments`(`razorpay_payment_id`) ON DELETE RESTRICT;

-- 9. Performance Indexes
ALTER TABLE `users` ADD INDEX `idx_users_role` (`role`);
ALTER TABLE `staff_profiles` ADD INDEX `idx_staff_user_id` (`user_id`);
ALTER TABLE `academic_sessions` ADD INDEX `idx_sessions_is_current` (`is_current`);
ALTER TABLE `teacher_assignments` ADD INDEX `idx_ta_section_id` (`section_id`);
ALTER TABLE `teacher_assignments` ADD INDEX `idx_ta_teacher_session` (`teacher_user_id`, `session_id`);
ALTER TABLE `timetables` ADD INDEX `idx_timetable_teacher` (`teacher_user_id`, `day_of_week`, `period_no`);
ALTER TABLE `timetables` ADD INDEX `idx_timetable_section` (`section_id`, `session_id`);
ALTER TABLE `exams` ADD INDEX `idx_exams_session_class` (`session_id`, `class_id`);
ALTER TABLE `homework` ADD INDEX `idx_homework_session_section` (`session_id`, `section_id`);
ALTER TABLE `fee_records` ADD INDEX `idx_fee_records_session` (`session_id`, `category_id`);
ALTER TABLE `notices` ADD INDEX `idx_notices_published` (`is_published`, `publish_date`);

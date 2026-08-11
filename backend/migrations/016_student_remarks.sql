CREATE TABLE IF NOT EXISTS `student_remarks` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `teacher_user_id` INT NOT NULL,
  `section_id` INT NOT NULL,
  `session_id` INT DEFAULT NULL,
  `month` TINYINT NOT NULL COMMENT '1=Jan..12=Dec',
  `year` SMALLINT NOT NULL,
  `remark` TEXT DEFAULT NULL,
  `tags` VARCHAR(500) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`teacher_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`session_id`) REFERENCES `academic_sessions`(`id`) ON DELETE SET NULL,
  UNIQUE KEY `uk_student_month_year` (`student_id`, `month`, `year`),
  INDEX `idx_section_month_year` (`section_id`, `month`, `year`)
) ENGINE=InnoDB;

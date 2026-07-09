CREATE TABLE IF NOT EXISTS `attendance` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `section_id` INT NOT NULL,
  `date` DATE NOT NULL,
  `status` ENUM('present','absent','late','holiday') NOT NULL,
  `marked_by` INT NOT NULL COMMENT 'teacher user_id',
  `remarks` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`),
  FOREIGN KEY (`marked_by`) REFERENCES `users`(`id`),
  UNIQUE KEY `uk_student_date` (`student_id`, `date`),
  INDEX `idx_section_date` (`section_id`, `date`),
  INDEX `idx_student_id` (`student_id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `exams` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `session_id` INT NOT NULL,
  `class_id` INT NOT NULL,
  `exam_type` ENUM('unit_test','mid_term','final','practical') DEFAULT 'unit_test',
  `start_date` DATE DEFAULT NULL,
  `end_date` DATE DEFAULT NULL,
  `status` ENUM('upcoming','ongoing','completed') DEFAULT 'upcoming',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`session_id`) REFERENCES `academic_sessions`(`id`),
  FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `marks` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `exam_id` INT NOT NULL,
  `student_id` INT NOT NULL,
  `subject_id` INT NOT NULL,
  `marks_obtained` DECIMAL(5,2) DEFAULT NULL,
  `max_marks` SMALLINT NOT NULL DEFAULT 100,
  `grade` VARCHAR(5) DEFAULT NULL,
  `remarks` VARCHAR(255) DEFAULT NULL,
  `entered_by` INT NOT NULL COMMENT 'teacher user_id',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`),
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`),
  UNIQUE KEY `uk_exam_student_subject` (`exam_id`, `student_id`, `subject_id`),
  INDEX `idx_student_id` (`student_id`)
) ENGINE=InnoDB;
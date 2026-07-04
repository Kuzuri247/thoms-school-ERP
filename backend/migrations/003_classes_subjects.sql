CREATE TABLE IF NOT EXISTS `subjects` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `code` VARCHAR(20) NOT NULL UNIQUE,
  `class_id` INT DEFAULT NULL,
  `max_marks` SMALLINT DEFAULT 100,
  `pass_marks` SMALLINT DEFAULT 35,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `teacher_assignments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `teacher_user_id` INT NOT NULL,
  `section_id` INT NOT NULL,
  `subject_id` INT DEFAULT NULL,
  `session_id` INT NOT NULL,
  `is_class_teacher` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`teacher_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`session_id`) REFERENCES `academic_sessions`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `uk_teacher_section_subject_session` (`teacher_user_id`,`section_id`,`subject_id`,`session_id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `timetables` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `section_id` INT NOT NULL,
  `subject_id` INT NOT NULL,
  `teacher_user_id` INT NOT NULL,
  `day_of_week` TINYINT NOT NULL COMMENT '1=Mon..5=Fri',
  `period_no` TINYINT NOT NULL,
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  `session_id` INT NOT NULL,
  FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`),
  FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`),
  FOREIGN KEY (`session_id`) REFERENCES `academic_sessions`(`id`)
) ENGINE=InnoDB;
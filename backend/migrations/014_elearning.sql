-- Migration 014: E Learning Materials Table
CREATE TABLE IF NOT EXISTS `elearning_materials` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `teacher_id` INT NOT NULL,
  `section_id` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `youtube_url` VARCHAR(500) NOT NULL,
  `youtube_video_id` VARCHAR(50) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`teacher_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON DELETE CASCADE,
  INDEX `idx_elearning_section` (`section_id`),
  INDEX `idx_elearning_teacher` (`teacher_id`)
) ENGINE=InnoDB;

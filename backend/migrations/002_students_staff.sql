CREATE TABLE IF NOT EXISTS `academic_sessions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `is_current` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `classes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL,
  `numeric_value` TINYINT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_class_name` (`name`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `sections` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `class_id` INT NOT NULL,
  `name` VARCHAR(10) NOT NULL,
  `capacity` SMALLINT DEFAULT 40,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `uk_class_section` (`class_id`, `name`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `students` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL UNIQUE,
  `admission_no` VARCHAR(50) NOT NULL UNIQUE,
  `roll_no` VARCHAR(20) DEFAULT NULL,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `date_of_birth` DATE DEFAULT NULL,
  `gender` ENUM('male','female','other') DEFAULT NULL,
  `blood_group` VARCHAR(5) DEFAULT NULL,
  `religion` VARCHAR(50) DEFAULT NULL,
  `caste` VARCHAR(50) DEFAULT NULL,
  `nationality` VARCHAR(50) DEFAULT 'Indian',
  `aadhar_no` VARCHAR(20) DEFAULT NULL,
  `photo_path` VARCHAR(500) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `city` VARCHAR(100) DEFAULT NULL,
  `state` VARCHAR(100) DEFAULT NULL,
  `pincode` VARCHAR(10) DEFAULT NULL,
  `section_id` INT DEFAULT NULL,
  `session_id` INT DEFAULT NULL,
  `admission_date` DATE DEFAULT NULL,
  `status` ENUM('active','inactive','transferred','left') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`session_id`) REFERENCES `academic_sessions`(`id`) ON DELETE SET NULL,
  INDEX `idx_admission_no` (`admission_no`),
  INDEX `idx_section_id` (`section_id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `guardians` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `relation` ENUM('father','mother','guardian') NOT NULL,
  `full_name` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `occupation` VARCHAR(100) DEFAULT NULL,
  `annual_income` DECIMAL(12,2) DEFAULT NULL,
  `aadhar_no` VARCHAR(20) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  INDEX `idx_student_id` (`student_id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `staff_profiles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL UNIQUE,
  `employee_code` VARCHAR(50) NOT NULL UNIQUE,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `date_of_birth` DATE DEFAULT NULL,
  `gender` ENUM('male','female','other') DEFAULT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `emergency_contact` VARCHAR(20) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `designation` VARCHAR(100) DEFAULT NULL,
  `department` VARCHAR(100) DEFAULT NULL,
  `joining_date` DATE DEFAULT NULL,
  `qualification` VARCHAR(255) DEFAULT NULL,
  `photo_path` VARCHAR(500) DEFAULT NULL,
  `documents_path` VARCHAR(500) DEFAULT NULL,
  `salary` DECIMAL(12,2) DEFAULT NULL,
  `status` ENUM('active','inactive','on_leave') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_employee_code` (`employee_code`)
) ENGINE=InnoDB;
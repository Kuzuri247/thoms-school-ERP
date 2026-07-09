CREATE TABLE IF NOT EXISTS `transport_routes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `route_no` VARCHAR(20) NOT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `bus_no` VARCHAR(30) DEFAULT NULL,
  `driver_name` VARCHAR(100) DEFAULT NULL,
  `driver_phone` VARCHAR(20) DEFAULT NULL,
  `conductor_name` VARCHAR(100) DEFAULT NULL,
  `conductor_phone` VARCHAR(20) DEFAULT NULL,
  `busstaff_user_id` INT DEFAULT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`busstaff_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `transport_stops` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `route_id` INT NOT NULL,
  `stop_name` VARCHAR(100) NOT NULL,
  `stop_order` TINYINT NOT NULL,
  `pickup_time` TIME DEFAULT NULL,
  `drop_time` TIME DEFAULT NULL,
  `monthly_fare` DECIMAL(8,2) DEFAULT 0.00,
  FOREIGN KEY (`route_id`) REFERENCES `transport_routes`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `student_transport` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL UNIQUE,
  `route_id` INT NOT NULL,
  `stop_id` INT NOT NULL,
  `session_id` INT NOT NULL,
  `pickup_type` ENUM('both','pickup_only','drop_only') DEFAULT 'both',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`route_id`) REFERENCES `transport_routes`(`id`),
  FOREIGN KEY (`stop_id`) REFERENCES `transport_stops`(`id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `notices` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT NOT NULL,
  `notice_type` ENUM('general','academic','fee','exam','transport','holiday') DEFAULT 'general',
  `target_roles` JSON DEFAULT NULL,
  `published_by` INT NOT NULL,
  `is_published` TINYINT(1) DEFAULT 1,
  `publish_date` DATE DEFAULT NULL,
  `expiry_date` DATE DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`published_by`) REFERENCES `users`(`id`)
) ENGINE=InnoDB;
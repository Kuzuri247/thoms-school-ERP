CREATE TABLE IF NOT EXISTS `fee_categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `fee_structures` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `session_id` INT NOT NULL,
  `class_id` INT NOT NULL,
  `category_id` INT NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `due_date` DATE DEFAULT NULL,
  `installments` TINYINT DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`session_id`) REFERENCES `academic_sessions`(`id`),
  FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`),
  FOREIGN KEY (`category_id`) REFERENCES `fee_categories`(`id`),
  UNIQUE KEY `uk_session_class_category` (`session_id`, `class_id`, `category_id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `fee_records` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `session_id` INT NOT NULL,
  `category_id` INT NOT NULL,
  `total_amount` DECIMAL(10,2) NOT NULL,
  `paid_amount` DECIMAL(10,2) DEFAULT 0.00,
  `discount_amount` DECIMAL(10,2) DEFAULT 0.00,
  `due_date` DATE DEFAULT NULL,
  `status` ENUM('PENDING','PARTIAL','PAID','OVERDUE','WAIVED') DEFAULT 'PENDING',
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`session_id`) REFERENCES `academic_sessions`(`id`),
  FOREIGN KEY (`category_id`) REFERENCES `fee_categories`(`id`),
  INDEX `idx_student_id` (`student_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `razorpay_orders` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `razorpay_order_id` VARCHAR(100) NOT NULL UNIQUE,
  `fee_record_id` BIGINT NOT NULL,
  `student_id` INT NOT NULL,
  `amount_paise` INT NOT NULL COMMENT 'amount in paise',
  `currency` CHAR(3) DEFAULT 'INR',
  `receipt` VARCHAR(100) NOT NULL,
  `status` ENUM('created','attempted','paid','failed') DEFAULT 'created',
  `created_by` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`fee_record_id`) REFERENCES `fee_records`(`id`),
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`),
  INDEX `idx_razorpay_order_id` (`razorpay_order_id`),
  INDEX `idx_fee_record_id` (`fee_record_id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `razorpay_payments` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `razorpay_payment_id` VARCHAR(100) NOT NULL UNIQUE,
  `razorpay_order_id` VARCHAR(100) NOT NULL,
  `razorpay_signature` VARCHAR(500) DEFAULT NULL,
  `amount_paise` INT NOT NULL,
  `currency` CHAR(3) DEFAULT 'INR',
  `method` VARCHAR(50) DEFAULT NULL,
  `status` ENUM('captured','failed','refunded','partially_refunded') DEFAULT 'captured',
  `captured_at` TIMESTAMP DEFAULT NULL,
  `raw_payload` JSON DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_razorpay_payment_id` (`razorpay_payment_id`),
  INDEX `idx_razorpay_order_id` (`razorpay_order_id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `refunds` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `razorpay_refund_id` VARCHAR(100) NOT NULL UNIQUE,
  `razorpay_payment_id` VARCHAR(100) NOT NULL,
  `amount_paise` INT NOT NULL,
  `status` ENUM('pending','processed','failed') DEFAULT 'pending',
  `reason` VARCHAR(255) DEFAULT NULL,
  `initiated_by` INT NOT NULL,
  `processed_at` TIMESTAMP DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`initiated_by`) REFERENCES `users`(`id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `receipts` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `receipt_no` VARCHAR(50) NOT NULL UNIQUE,
  `razorpay_payment_id` VARCHAR(100) NOT NULL,
  `fee_record_id` BIGINT NOT NULL,
  `student_id` INT NOT NULL,
  `pdf_path` VARCHAR(500) DEFAULT NULL,
  `generated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`fee_record_id`) REFERENCES `fee_records`(`id`),
  INDEX `idx_student_id` (`student_id`)
) ENGINE=InnoDB;
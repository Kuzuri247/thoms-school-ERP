-- 018_cbse_monthly_fees_and_bus_receipts.sql
-- Migration for CBSE Monthly Fees Engine, Transport Opt-in, Lockout & Dynamic Receipts

-- 1. CBSE Academic Year Month Master / Tracking Table
CREATE TABLE IF NOT EXISTS student_monthly_fees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  academic_year VARCHAR(10) NOT NULL DEFAULT '2026-2027',
  month_code VARCHAR(10) NOT NULL,    -- 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC', 'JAN', 'FEB', 'MAR'
  month_order INT NOT NULL,           -- 1 for APR, 12 for MAR
  tuition_fee DECIMAL(10, 2) DEFAULT 0.00,
  bus_fee DECIMAL(10, 2) DEFAULT 0.00,
  total_due DECIMAL(10, 2) DEFAULT 0.00,
  amount_paid DECIMAL(10, 2) DEFAULT 0.00,
  due_date DATE NOT NULL,
  status ENUM('PAID', 'PENDING', 'PARTIAL', 'OVERDUE') DEFAULT 'PENDING',
  paid_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  UNIQUE KEY unique_student_month (student_id, academic_year, month_code),
  INDEX idx_student_status (student_id, status),
  INDEX idx_due_date (due_date)
) ENGINE=InnoDB;

-- 2. Extend Students Table for Bus Opt-In & Lockout Status
ALTER TABLE students 
ADD COLUMN opts_bus_service BOOLEAN DEFAULT FALSE,
ADD COLUMN bus_distance_slab VARCHAR(50) NULL,
ADD COLUMN bus_quarterly_fee DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN is_access_restricted BOOLEAN DEFAULT FALSE,
ADD COLUMN pending_months_count INT DEFAULT 0;

-- 3. Enhance Receipts Table & Razorpay Orders for Separate Bus & Monthly Receipts
ALTER TABLE razorpay_orders 
MODIFY fee_record_id BIGINT NULL,
ADD COLUMN monthly_fee_id INT NULL;

ALTER TABLE receipts 
MODIFY fee_record_id BIGINT NULL,
ADD COLUMN monthly_fee_id INT NULL,
ADD COLUMN receipt_type ENUM('TUITION_FEE', 'BUS_FEE', 'COMBINED') DEFAULT 'TUITION_FEE',
ADD COLUMN month_code VARCHAR(10) NULL,
ADD COLUMN razorpay_order_id VARCHAR(100) NULL,
ADD COLUMN razorpay_signature VARCHAR(255) NULL,
ADD COLUMN bank_ref_no VARCHAR(100) NULL,
ADD COLUMN transaction_type VARCHAR(100) DEFAULT 'ONLINE TUITION FEE',
ADD INDEX idx_receipts_monthly_fee (monthly_fee_id),
ADD CONSTRAINT fk_receipts_monthly_fee FOREIGN KEY (monthly_fee_id) REFERENCES student_monthly_fees(id) ON DELETE RESTRICT;

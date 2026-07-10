-- 007_exam_structure.sql
-- Adds half-year tracking and configurable weightage for 2 internals + 1 semester exam structure

ALTER TABLE exams
  ADD COLUMN half_year ENUM('H1','H2') NOT NULL DEFAULT 'H1' AFTER exam_type;

ALTER TABLE exams
  MODIFY COLUMN exam_type ENUM('internal_1','internal_2','semester') NOT NULL DEFAULT 'internal_1';

CREATE TABLE IF NOT EXISTS exam_weightage (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id INT NOT NULL,
  half_year ENUM('H1','H2') NOT NULL,
  internal_1_weight DECIMAL(4,2) DEFAULT 20.00,
  internal_2_weight DECIMAL(4,2) DEFAULT 20.00,
  semester_weight DECIMAL(4,2) DEFAULT 60.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES academic_sessions(id) ON DELETE CASCADE,
  UNIQUE KEY uk_session_half (session_id, half_year)
) ENGINE=InnoDB;
-- 008_homework.sql
-- Homework / coursework assignment and per-student submission tracking

CREATE TABLE IF NOT EXISTS homework (
  id INT AUTO_INCREMENT PRIMARY KEY,
  section_id INT NOT NULL,
  subject_id INT DEFAULT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT NULL,
  attachment_path VARCHAR(500) DEFAULT NULL,
  assigned_by INT NOT NULL COMMENT 'teacher user_id',
  assigned_date DATE NOT NULL,
  due_date DATE NOT NULL,
  session_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
  FOREIGN KEY (assigned_by) REFERENCES users(id),
  FOREIGN KEY (session_id) REFERENCES academic_sessions(id),
  INDEX idx_section_due (section_id, due_date)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS homework_submissions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  homework_id INT NOT NULL,
  student_id INT NOT NULL,
  status ENUM('pending','submitted','completed','late','not_done') DEFAULT 'pending',
  submitted_at TIMESTAMP NULL,
  attachment_path VARCHAR(500) DEFAULT NULL,
  remarks VARCHAR(255) DEFAULT NULL,
  marked_by INT DEFAULT NULL COMMENT 'teacher user_id who updated status',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (homework_id) REFERENCES homework(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  UNIQUE KEY uk_homework_student (homework_id, student_id),
  INDEX idx_student_id (student_id)
) ENGINE=InnoDB;
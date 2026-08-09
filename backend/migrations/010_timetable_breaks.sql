-- 010_timetable_breaks.sql
ALTER TABLE timetables MODIFY COLUMN subject_id INT NULL;
ALTER TABLE timetables MODIFY COLUMN teacher_user_id INT NULL;
ALTER TABLE timetables ADD COLUMN is_break TINYINT(1) DEFAULT 0 AFTER end_time;
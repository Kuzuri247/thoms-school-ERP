-- 010_timetable_breaks.sql
ALTER TABLE timetables
  ADD COLUMN IF NOT EXISTS is_break TINYINT(1) DEFAULT 0 AFTER end_time;
-- Widen status column ENUMs for students and users tables to include 'graduated'
ALTER TABLE `students` MODIFY COLUMN `status` ENUM('active','inactive','transferred','left','graduated') DEFAULT 'active';
ALTER TABLE `users` MODIFY COLUMN `status` ENUM('active','inactive','suspended','graduated') DEFAULT 'active';

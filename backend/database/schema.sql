-- ============================================================================
-- Skill Gap Analyzer - MySQL Database Migration
-- Database: skill_gap
-- Target Table: students
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `skill_gap`
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `skill_gap`;

-- ============================================================================
-- Table: students (Users & Roles Table)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `students` (
  `student_id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'student') NOT NULL DEFAULT 'student',
  `reset_token` VARCHAR(255) NULL,
  `reset_token_expiry` DATETIME NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_students_email` (`email`),
  INDEX `idx_students_reset_token` (`reset_token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional default seed accounts (password: Admin@123 / Student@123)
-- Admin: admin@skillgap.com | Student: arun@skillgap.com
INSERT IGNORE INTO `students` (`student_id`, `name`, `email`, `password`, `role`) VALUES
(1, 'Admin Administrator', 'admin@skillgap.com', '$2a$10$X8m1736k3h89dYkL2.1Zze5jT2J9f3eXv4Vp47r0eHqB9mN0x2q9a', 'admin'),
(2, 'Arun Kumar', 'arun@skillgap.com', '$2a$10$X8m1736k3h89dYkL2.1Zze5jT2J9f3eXv4Vp47r0eHqB9mN0x2q9a', 'student');

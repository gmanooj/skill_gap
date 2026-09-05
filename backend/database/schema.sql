-- ============================================================================
-- Skill Gap Analyzer - MySQL Full Database Schema & Seed Data
-- Database: skill_gap
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `skill_gap`
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `skill_gap`;

-- 1. Table: students (Users & Roles Table)
CREATE TABLE IF NOT EXISTS `students` (
  `student_id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'student') NOT NULL DEFAULT 'student',
  `target_title` VARCHAR(150) DEFAULT 'Java Full Stack Developer',
  `reset_token` VARCHAR(255) NULL,
  `reset_token_expiry` DATETIME NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_students_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Table: student_skills
CREATE TABLE IF NOT EXISTS `student_skills` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `skill_name` VARCHAR(100) NOT NULL,
  `proficiency_level` INT NOT NULL DEFAULT 1,
  `proficiency_tag` VARCHAR(50) DEFAULT 'Beginner',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_student_skill` (`student_id`, `skill_name`),
  FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Table: jobs
CREATE TABLE IF NOT EXISTS `jobs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(150) NOT NULL,
  `company` VARCHAR(150) NOT NULL DEFAULT 'ABC Technologies',
  `location` VARCHAR(150) DEFAULT 'Remote / Chennai',
  `department` VARCHAR(150) DEFAULT 'Core Product Engineering',
  `experience` VARCHAR(100) DEFAULT '2–4 Years Experience',
  `description` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Table: job_requirements (or job_skills)
CREATE TABLE IF NOT EXISTS `job_requirements` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `job_id` INT NOT NULL,
  `skill_name` VARCHAR(100) NOT NULL,
  `required_level` INT NOT NULL DEFAULT 3,
  `mandatory` BOOLEAN NOT NULL DEFAULT TRUE,
  `category` VARCHAR(100) DEFAULT 'Technical',
  UNIQUE KEY `unique_job_skill` (`job_id`, `skill_name`),
  FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Table: job_applications
CREATE TABLE IF NOT EXISTS `job_applications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `job_id` INT NOT NULL,
  `applied_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `status` VARCHAR(50) DEFAULT 'Applied',
  UNIQUE KEY `unique_student_job_application` (`student_id`, `job_id`),
  FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE,
  FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Table: recommendations
CREATE TABLE IF NOT EXISTS `recommendations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `skill_name` VARCHAR(100) NOT NULL,
  `priority` ENUM('High', 'Medium', 'Low') NOT NULL DEFAULT 'Medium',
  `target_level` INT NOT NULL DEFAULT 3,
  `reason` VARCHAR(255) NOT NULL,
  `course_title` VARCHAR(255) DEFAULT '',
  `provider` VARCHAR(100) DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

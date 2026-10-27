CREATE TABLE IF NOT EXISTS schools (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  school_code VARCHAR(32) NOT NULL UNIQUE,
  name VARCHAR(180) NOT NULL,
  location VARCHAR(180) NOT NULL DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS classrooms (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  school_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(120) NOT NULL,
  year_level VARCHAR(80) NOT NULL DEFAULT '',
  subject_focus VARCHAR(120) NOT NULL DEFAULT 'Science',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_classroom_school_name (school_id, name),
  CONSTRAINT fk_classrooms_school FOREIGN KEY (school_id) REFERENCES schools(id)
);

CREATE TABLE IF NOT EXISTS members (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  school_id BIGINT UNSIGNED NOT NULL,
  classroom_id BIGINT UNSIGNED NULL,
  full_name VARCHAR(160) NOT NULL,
  email VARCHAR(190) NOT NULL,
  role ENUM('student','teacher','admin') NOT NULL DEFAULT 'student',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_member_school_email (school_id, email),
  CONSTRAINT fk_members_school FOREIGN KEY (school_id) REFERENCES schools(id),
  CONSTRAINT fk_members_classroom FOREIGN KEY (classroom_id) REFERENCES classrooms(id)
);

CREATE TABLE IF NOT EXISTS practicals (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(100) NOT NULL UNIQUE,
  subject VARCHAR(80) NOT NULL,
  title VARCHAR(180) NOT NULL,
  summary VARCHAR(500) NOT NULL,
  duration_minutes SMALLINT UNSIGNED NOT NULL DEFAULT 15,
  points SMALLINT UNSIGNED NOT NULL DEFAULT 40,
  content_json JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assessments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  classroom_id BIGINT UNSIGNED NOT NULL,
  author_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(180) NOT NULL,
  subject VARCHAR(80) NOT NULL,
  kind ENUM('exam','test','assignment') NOT NULL DEFAULT 'test',
  instructions TEXT NOT NULL,
  due_at DATETIME NULL,
  question_count SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  timed BOOLEAN NOT NULL DEFAULT FALSE,
  duration_minutes SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  questions_json JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_assessments_classroom FOREIGN KEY (classroom_id) REFERENCES classrooms(id),
  CONSTRAINT fk_assessments_author FOREIGN KEY (author_id) REFERENCES members(id)
);

CREATE TABLE IF NOT EXISTS submissions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  assessment_id BIGINT UNSIGNED NOT NULL,
  student_id BIGINT UNSIGNED NOT NULL,
  answers_json JSON NOT NULL,
  score DECIMAL(5,2) NULL,
  feedback TEXT NOT NULL,
  status ENUM('submitted','graded') NOT NULL DEFAULT 'submitted',
  submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP NULL,
  UNIQUE KEY uq_submission_student_assessment (assessment_id, student_id),
  CONSTRAINT fk_submissions_assessment FOREIGN KEY (assessment_id) REFERENCES assessments(id),
  CONSTRAINT fk_submissions_student FOREIGN KEY (student_id) REFERENCES members(id)
);

CREATE TABLE IF NOT EXISTS practical_progress (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  student_id BIGINT UNSIGNED NOT NULL,
  practical_id BIGINT UNSIGNED NOT NULL,
  points_awarded SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  completed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_progress_student_practical (student_id, practical_id),
  CONSTRAINT fk_progress_student FOREIGN KEY (student_id) REFERENCES members(id),
  CONSTRAINT fk_progress_practical FOREIGN KEY (practical_id) REFERENCES practicals(id)
);

CREATE TABLE IF NOT EXISTS achievements (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  student_id BIGINT UNSIGNED NOT NULL,
  achievement_slug VARCHAR(100) NOT NULL,
  earned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_achievement_student_slug (student_id, achievement_slug),
  CONSTRAINT fk_achievements_student FOREIGN KEY (student_id) REFERENCES members(id)
);

CREATE TABLE IF NOT EXISTS class_alerts (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  school_id BIGINT UNSIGNED NOT NULL,
  member_id BIGINT UNSIGNED NULL,
  title VARCHAR(180) NOT NULL,
  body VARCHAR(500) NOT NULL,
  alert_type VARCHAR(48) NOT NULL DEFAULT 'class_activity',
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_alerts_school FOREIGN KEY (school_id) REFERENCES schools(id),
  CONSTRAINT fk_alerts_member FOREIGN KEY (member_id) REFERENCES members(id)
);

CREATE TABLE IF NOT EXISTS resources (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  practical_id BIGINT UNSIGNED NULL,
  title VARCHAR(180) NOT NULL,
  resource_type ENUM('illustration','video','worksheet','evidence','attachment') NOT NULL DEFAULT 'worksheet',
  storage_key VARCHAR(512) NOT NULL DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_resources_practical FOREIGN KEY (practical_id) REFERENCES practicals(id)
);

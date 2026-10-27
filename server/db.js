import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';
import { sampleAssessments, sampleClasses, sampleMembers, samplePracticals, sampleSchool } from './sample-data.js';

const schemaPath = fileURLToPath(new URL('./schema.sql', import.meta.url));
export let pool = null;
export let databaseReady = false;
export let demoIds = { schoolId: null, classroomId: null, studentId: null, teacherId: null };

export async function initializeDatabase() {
  if (!process.env.DATABASE_URL) return false;
  try {
    pool = mysql.createPool({
      uri: process.env.DATABASE_URL,
      waitForConnections: true,
      connectionLimit: 6,
      queueLimit: 0,
      enableKeepAlive: true,
    });
    const statements = (await readFile(schemaPath, 'utf8')).split(';').map((part) => part.trim()).filter(Boolean);
    for (const statement of statements) await pool.query(statement);
    await seedReferenceData();
    databaseReady = true;
    return true;
  } catch (error) {
    console.error('Managed database could not be initialized:', error.message);
    if (pool) await pool.end().catch(() => {});
    pool = null;
    databaseReady = false;
    return false;
  }
}

async function seedReferenceData() {
  await pool.execute(
    'INSERT IGNORE INTO schools (school_code, name, location) VALUES (?, ?, ?)',
    [sampleSchool.schoolCode, sampleSchool.name, sampleSchool.location],
  );
  const [[school]] = await pool.execute('SELECT id FROM schools WHERE school_code = ?', [sampleSchool.schoolCode]);
  demoIds.schoolId = Number(school.id);

  for (const classroom of sampleClasses) {
    await pool.execute(
      'INSERT IGNORE INTO classrooms (school_id, name, year_level, subject_focus) VALUES (?, ?, ?, ?)',
      [demoIds.schoolId, classroom.name, classroom.yearLevel, classroom.subjectFocus],
    );
  }
  const [[classroom]] = await pool.execute('SELECT id FROM classrooms WHERE school_id = ? ORDER BY id LIMIT 1', [demoIds.schoolId]);
  demoIds.classroomId = Number(classroom.id);

  for (const member of sampleMembers) {
    await pool.execute(
      'INSERT IGNORE INTO members (school_id, classroom_id, full_name, email, role) VALUES (?, ?, ?, ?, ?)',
      [demoIds.schoolId, member.role === 'teacher' ? null : demoIds.classroomId, member.fullName, member.email, member.role],
    );
  }
  const [[student]] = await pool.execute('SELECT id FROM members WHERE school_id = ? AND role = ? ORDER BY id LIMIT 1', [demoIds.schoolId, 'student']);
  const [[teacher]] = await pool.execute('SELECT id FROM members WHERE school_id = ? AND role = ? ORDER BY id LIMIT 1', [demoIds.schoolId, 'teacher']);
  demoIds.studentId = Number(student.id);
  demoIds.teacherId = Number(teacher.id);

  for (const practical of samplePracticals) {
    await pool.execute(
      'INSERT IGNORE INTO practicals (slug, subject, title, summary, duration_minutes, points, content_json) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [practical.slug, practical.subject, practical.title, practical.summary, practical.durationMinutes, practical.points, JSON.stringify(practical.details)],
    );
  }
  for (const assessment of sampleAssessments) {
    const [existing] = await pool.execute('SELECT id FROM assessments WHERE title = ? AND classroom_id = ? LIMIT 1', [assessment.title, demoIds.classroomId]);
    if (existing.length) continue;
    await pool.execute(
      `INSERT INTO assessments (classroom_id, author_id, title, subject, kind, instructions, due_at, question_count, timed, duration_minutes, published, questions_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, ?)`,
      [demoIds.classroomId, demoIds.teacherId, assessment.title, assessment.subject, assessment.kind, assessment.instructions, assessment.dueAt.replace('T', ' '), assessment.questionCount, assessment.timed, assessment.durationMinutes, JSON.stringify(assessment.questions)],
    );
  }
  const [[soilAssignment]] = await pool.execute('SELECT id FROM assessments WHERE title = ? AND classroom_id = ? LIMIT 1', ['Soil profile field notes', demoIds.classroomId]);
  const [[kojo]] = await pool.execute('SELECT id FROM members WHERE school_id = ? AND email = ?', [demoIds.schoolId, 'kojo.demo@labquest.school']);
  const [[amara]] = await pool.execute('SELECT id FROM members WHERE school_id = ? AND email = ?', [demoIds.schoolId, 'amara.demo@labquest.school']);
  if (soilAssignment && kojo && amara) {
    await pool.execute(
      "INSERT IGNORE INTO submissions (assessment_id, student_id, answers_json, status) VALUES (?, ?, ?, 'submitted')",
      [soilAssignment.id, kojo.id, JSON.stringify({ 0: 'The wide sand layer should let water drain quickly. The finer clay layer may hold on to more water.' })],
    );
    await pool.execute(
      "INSERT IGNORE INTO submissions (assessment_id, student_id, answers_json, score, feedback, status) VALUES (?, ?, ?, 88, ?, 'graded')",
      [soilAssignment.id, amara.id, JSON.stringify({ 0: 'The coarse sand layer should allow water to drain quickly.' }), 'Good use of evidence. Add a note about clay’s water retention.'],
    );
  }
  const [existingAlert] = await pool.execute('SELECT id FROM class_alerts WHERE school_id = ? LIMIT 1', [demoIds.schoolId]);
  if (!existingAlert.length) {
    await pool.execute(
      'INSERT INTO class_alerts (school_id, member_id, title, body, alert_type) VALUES (?, ?, ?, ?, ?)',
      [demoIds.schoolId, demoIds.studentId, 'A new Biology test is ready', 'Cell Biology Check-in · due Thursday', 'assessment_published'],
    );
  }
}

export async function query(sql, params = []) {
  if (!databaseReady || !pool) throw new Error('Managed database is not available');
  return pool.execute(sql, params);
}

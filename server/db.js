import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import mysql from 'mysql2/promise';
import { sampleAssessments, sampleClasses, sampleMembers, samplePracticals, sampleSchool } from './sample-data.js';

const schemaPath = fileURLToPath(new URL('./schema.sql', import.meta.url));
const sqlitePath = process.env.DATABASE_PATH || join(process.cwd(), 'data', 'labquest.sqlite');
export let pool = null;
export let databaseReady = false;
export let demoIds = { schoolId: null, classroomId: null, studentId: null, teacherId: null };

let sqliteStore = null;

export function resolveDatabaseMode() {
  const configuredType = String(process.env.DATABASE_TYPE || process.env.DB_TYPE || '').trim().toLowerCase();
  const databaseUrl = String(process.env.DATABASE_URL || '').trim();
  if (configuredType === 'mysql') return 'mysql';
  if (configuredType === 'sqlite') return 'sqlite';
  if (databaseUrl && /^sqlite|^file:/i.test(databaseUrl)) return 'sqlite';
  if (databaseUrl) return 'mysql';
  return 'sqlite';
}

function ensureSqliteStore() {
  if (sqliteStore) return sqliteStore;
  mkdirSync(dirname(sqlitePath), { recursive: true });
  sqliteStore = new DatabaseSync(sqlitePath);
  sqliteStore.exec(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS schools (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      school_code TEXT UNIQUE NOT NULL,
      location TEXT,
      contact_email TEXT,
      access_type TEXT NOT NULL DEFAULT 'school-admin',
      status TEXT NOT NULL DEFAULT 'pending',
      package_plan TEXT NOT NULL DEFAULT 'starter',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      approved_at TEXT
    );
    CREATE TABLE IF NOT EXISTS school_access_requests (
      id TEXT PRIMARY KEY,
      school_name TEXT NOT NULL,
      contact_email TEXT,
      location TEXT,
      access_type TEXT NOT NULL DEFAULT 'school-admin',
      school_code TEXT UNIQUE NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      package_plan TEXT NOT NULL DEFAULT 'starter',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      school_id TEXT,
      school_name TEXT,
      access_code TEXT,
      location TEXT,
      package_plan TEXT DEFAULT 'starter',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (school_id) REFERENCES schools(id)
    );
  `);

  const existingUsers = sqliteStore.prepare('SELECT COUNT(*) AS total FROM users').get();
  if (!existingUsers || existingUsers.total === 0) {
    const demoAccounts = [
      { id: 'user-admin', email: 'admin@labquest.edu.ng', password: 'LabQuest2026!', name: 'LabQuest Admin', role: 'admin', school_name: 'LabQuest HQ', access_code: 'LABQUEST-ADMIN', location: 'Lagos, Nigeria', package_plan: 'full' },
      { id: 'user-teacher', email: 'teacher@labquest.edu.ng', password: 'LabQuest2026!', name: 'Mrs. Esi Boateng', role: 'teacher', school_name: 'Northstar Science Academy', access_code: 'LABQUEST-TEACHER', location: 'Accra, Ghana', package_plan: 'premium' },
      { id: 'user-student', email: 'student@labquest.edu.ng', password: 'LabQuest2026!', name: 'Amara Owusu', role: 'student', school_name: 'Northstar Science Academy', access_code: 'LABQUEST-STUDENT', location: 'Accra, Ghana', package_plan: 'starter' },
    ];
    for (const user of demoAccounts) {
      const school = sqliteStore.prepare('SELECT id FROM schools WHERE school_code = ?').get(user.access_code);
      sqliteStore.prepare(
        'INSERT INTO users (id, email, password, name, role, school_name, access_code, location, package_plan) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).run(user.id, user.email, user.password, user.name, user.role, user.school_name, user.access_code, user.location, user.package_plan);
      if (!school && user.role !== 'admin') {
        const schoolId = `school-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        sqliteStore.prepare(
          'INSERT OR IGNORE INTO schools (id, name, school_code, location, contact_email, access_type, status, package_plan) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        ).run(schoolId, user.school_name, user.access_code, user.location, user.email, user.role === 'teacher' ? 'teacher' : 'student', 'active', user.package_plan);
      }
    }
  }
  return sqliteStore;
}

export function normalizeAccessType(value) {
  const nextValue = String(value || '').trim().toLowerCase();
  if (nextValue === 'school-admin' || nextValue === 'admin') return 'school-admin';
  if (nextValue === 'teacher') return 'teacher';
  return 'student';
}

export function generateSchoolCode(name) {
  const prefix = String(name || 'LABQUEST').replace(/[^a-zA-Z0-9]/g, '').slice(0, 5).toUpperCase() || 'LABQ';
  const suffix = String(Date.now()).slice(-4);
  return `${prefix}-${suffix}`;
}

export function createSchoolAccessRequest({ schoolName, location, email, accessType = 'school-admin', packagePlan = 'starter', code } = {}) {
  const db = ensureSqliteStore();
  const cleanedName = String(schoolName || '').trim();
  if (!cleanedName) throw new Error('School name is required.');
  const normalizedType = normalizeAccessType(accessType);
  const schoolCode = String(code || generateSchoolCode(cleanedName)).trim().toUpperCase();
  const requestId = `request-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  db.prepare(
    'INSERT INTO school_access_requests (id, school_name, contact_email, location, access_type, school_code, status, package_plan) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(requestId, cleanedName, String(email || '').trim() || 'pending@labquest.edu.ng', String(location || '').trim() || 'Awaiting location', normalizedType, schoolCode, 'pending', String(packagePlan || 'starter'));

  return {
    id: requestId,
    name: cleanedName,
    code: schoolCode,
    accessType: normalizedType,
    status: 'Pending',
    region: String(location || '').trim() || 'Awaiting location',
    members: 1,
    lastAccess: 'Just now',
    contactEmail: String(email || '').trim() || 'pending@labquest.edu.ng',
  };
}

export function approveSchoolAccess({ schoolId, schoolCode, schoolName, accessType = 'school-admin', packagePlan = 'starter' } = {}) {
  const db = ensureSqliteStore();
  const cleanedName = String(schoolName || '').trim();
  const normalizedType = normalizeAccessType(accessType);
  const code = String(schoolCode || '').trim().toUpperCase() || generateSchoolCode(cleanedName || 'LABQUEST');
  const targetRequest = schoolId ? db.prepare('SELECT * FROM school_access_requests WHERE id = ?').get(schoolId) : db.prepare('SELECT * FROM school_access_requests WHERE school_code = ? ORDER BY created_at DESC LIMIT 1').get(code);
  const schoolIdValue = String(targetRequest?.id || `${Date.now()}`);
  const name = cleanedName || targetRequest?.school_name || 'School';
  const id = `school-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  db.prepare(
    'INSERT OR REPLACE INTO schools (id, name, school_code, location, contact_email, access_type, status, package_plan, approved_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)'
  ).run(targetRequest ? id : id, name, code, targetRequest?.location || 'Awaiting location', targetRequest?.contact_email || 'pending@labquest.edu.ng', normalizedType, 'active', String(packagePlan || 'starter'));

  if (targetRequest) {
    db.prepare('UPDATE school_access_requests SET status = ? WHERE id = ?').run('approved', targetRequest.id);
  }

  return {
    id,
    name,
    code,
    accessType: normalizedType,
    status: 'Active',
    region: targetRequest?.location || 'Awaiting location',
    members: 1,
    lastAccess: 'Just now',
    contactEmail: targetRequest?.contact_email || 'pending@labquest.edu.ng',
  };
}

export function listSchools() {
  const db = ensureSqliteStore();
  const approved = db.prepare(`
    SELECT id, name, school_code AS code, access_type AS accessType, status, location AS region, 1 AS members, 'Just now' AS lastAccess, contact_email AS contactEmail, package_plan AS packagePlan
    FROM schools
    ORDER BY approved_at DESC, created_at DESC
  `).all();
  const pending = db.prepare(`
    SELECT id, school_name AS name, school_code AS code, access_type AS accessType, status, location AS region, 1 AS members, 'Just now' AS lastAccess, contact_email AS contactEmail, package_plan AS packagePlan
    FROM school_access_requests
    WHERE status != 'approved'
    ORDER BY created_at DESC
  `).all();
  return [
    ...pending.map((item) => ({ ...item, status: 'Pending', accessType: normalizeAccessType(item.accessType) })),
    ...approved.map((item) => ({ ...item, status: 'Active', accessType: normalizeAccessType(item.accessType) })),
  ];
}

export function authenticateUser({ email, password, accessCode, role } = {}) {
  const db = ensureSqliteStore();
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const normalizedPassword = String(password || '');
  const normalizedRole = normalizeAccessType(role);
  const normalizedAccessCode = String(accessCode || '').trim().toUpperCase();

  const user = db.prepare('SELECT * FROM users WHERE email = ? AND password = ?').get(normalizedEmail, normalizedPassword);
  if (!user) {
    const fallback = db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail);
    if (fallback && fallback.password !== normalizedPassword) {
      throw new Error('Invalid credentials.');
    }
    throw new Error('User not found.');
  }

  if (normalizedRole && user.role !== normalizedRole && !(normalizedRole === 'school-admin' && user.role === 'admin')) {
    throw new Error('Role mismatch.');
  }

  if (normalizedAccessCode && user.access_code && normalizedAccessCode !== user.access_code.toUpperCase()) {
    throw new Error('Access code mismatch.');
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    schoolName: user.school_name || 'LabQuest School',
    location: user.location || 'Unknown location',
    accessCode: user.access_code || '',
    packagePlan: user.package_plan || 'starter',
  };
}

export function registerUser({ role, email, password, confirmPassword, accessCode, schoolName, schoolEmail, location, plan } = {}) {
  const db = ensureSqliteStore();
  const normalizedRole = normalizeAccessType(role);
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const normalizedPassword = String(password || '');
  const normalizedConfirmPassword = String(confirmPassword || '');

  if (!normalizedEmail || !normalizedPassword || normalizedPassword !== normalizedConfirmPassword) {
    throw new Error('Complete all required fields and confirm the password matches.');
  }

  if (db.prepare('SELECT 1 FROM users WHERE email = ?').get(normalizedEmail)) {
    throw new Error('An account already exists for this email address.');
  }

  const packagePlan = String(plan || 'starter').toLowerCase();
  let schoolRecord = null;
  let assignedCode = String(accessCode || '').trim().toUpperCase();

  if (normalizedRole === 'school-admin') {
    const cleanedName = String(schoolName || '').trim();
    if (!cleanedName) throw new Error('School name is required.');
    assignedCode = generateSchoolCode(cleanedName);
    schoolRecord = createSchoolAccessRequest({ schoolName: cleanedName, location, email: schoolEmail || normalizedEmail, accessType: 'school-admin', packagePlan, code: assignedCode });
  } else {
    const schoolMatch = db.prepare('SELECT * FROM schools WHERE school_code = ? AND status = ?').get(assignedCode, 'active');
    if (!assignedCode || !schoolMatch) {
      throw new Error('A valid school access code is required for student and teacher registration.');
    }
  }

  const userId = `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const record = {
    id: userId,
    email: normalizedEmail,
    password: normalizedPassword,
    name: normalizedRole === 'school-admin' ? String(schoolName || 'School Admin').trim() : String(schoolName || 'New User').trim() || 'New User',
    role: normalizedRole === 'school-admin' ? 'admin' : normalizedRole,
    school_name: normalizedRole === 'school-admin' ? String(schoolName || 'School').trim() : (schoolRecord ? schoolRecord.name : String(schoolName || 'LabQuest School').trim()),
    access_code: assignedCode || generateSchoolCode(schoolName || 'LABQUEST'),
    location: String(location || '').trim() || 'Unknown location',
    package_plan: packagePlan,
  };

  db.prepare(
    'INSERT INTO users (id, email, password, name, role, school_name, access_code, location, package_plan) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(record.id, record.email, record.password, record.name, record.role, record.school_name, record.access_code, record.location, record.package_plan);

  return {
    ok: true,
    user: {
      id: record.id,
      email: record.email,
      name: record.name,
      role: record.role,
      schoolName: record.school_name,
      location: record.location,
      accessCode: record.access_code,
      packagePlan: record.package_plan,
    },
  };
}

export async function initializeDatabase() {
  const mode = resolveDatabaseMode();
  if (mode === 'sqlite') {
    ensureSqliteStore();
    databaseReady = true;
    return true;
  }
  if (!process.env.DATABASE_URL) {
    ensureSqliteStore();
    databaseReady = true;
    return true;
  }
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
  if (!databaseReady) throw new Error('Managed database is not available');
  if (pool) return pool.execute(sql, params);
  const db = ensureSqliteStore();
  const statement = db.prepare(sql);
  const isWrite = /^(INSERT|UPDATE|DELETE|REPLACE|CREATE|ALTER|DROP|BEGIN|COMMIT|ROLLBACK)/i.test(String(sql).trim());
  if (isWrite) {
    const result = statement.run(...(Array.isArray(params) ? params : [params]));
    return [result, null];
  }
  const rows = statement.all(...(Array.isArray(params) ? params : [params]));
  return [rows, null];
}

import express from 'express';
import session from 'express-session';
import { createServer as createViteServer } from 'vite';
import { authenticateUser, approveSchoolAccess, createSchoolAccessRequest, demoIds, initializeDatabase, listSchools, query, registerUser } from './db.js';
import { sampleAlerts, sampleAssessments, sampleClasses, sampleMembers, samplePracticals, sampleSchool, sampleSubmissionQueue } from './sample-data.js';

const app = express();
const port = Number(process.env.PORT || 3000);
const SESSION_SECRET = process.env.SESSION_SECRET || 'labquest-demo-secret';
const mockUsers = {
  'admin@labquest.edu.ng': { id: 'user-admin', email: 'admin@labquest.edu.ng', name: 'LabQuest Admin', role: 'admin', password: 'LabQuest2026!' },
  'teacher@labquest.edu.ng': { id: 'user-teacher', email: 'teacher@labquest.edu.ng', name: 'Mrs. Esi Boateng', role: 'teacher', password: 'LabQuest2026!' },
  'student@labquest.edu.ng': { id: 'user-student', email: 'student@labquest.edu.ng', name: 'Amara Owusu', role: 'student', password: 'LabQuest2026!' },
};

app.use(express.json({ limit: '256kb' }));
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 8,
  },
}));

const fallbackBootstrap = () => ({
  connected: false,
  source: 'sample',
  school: sampleSchool,
  classes: sampleClasses,
  studentClassName: sampleClasses[0]?.name,
  members: sampleMembers,
  practicals: samplePracticals.map(({ slug, subject, title, summary, durationMinutes, points }) => ({ slug, subject, title, summary, durationMinutes, points })),
  assessments: sampleAssessments,
  alerts: sampleAlerts,
  submissions: sampleSubmissionQueue,
  completedPracticals: [],
  progress: { practicalsCompleted: 18, totalPracticals: 24, points: 740, streakDays: 6 },
});

const isAuthenticated = (req) => Boolean(req.session?.user);
const requireAuth = (req, res, next) => {
  if (!isAuthenticated(req)) {
    return res.status(401).json({ ok: false, error: 'Authentication required.' });
  }
  return next();
};
const requireRole = (roles) => (req, res, next) => {
  if (!isAuthenticated(req) || !roles.includes(req.session.user.role)) {
    return res.status(403).json({ ok: false, error: 'Access denied.' });
  }
  return next();
};

app.get('/api/health', (_req, res) => res.json({ ok: true, database: Boolean(process.env.DATABASE_URL) }));

app.post('/api/auth/register', (req, res) => {
  try {
    const payload = { ...req.body };
    const result = registerUser(payload);
    return res.json(result);
  } catch (error) {
    return res.status(400).json({ ok: false, error: error.message || 'Registration failed.' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password, role, accessCode } = req.body || {};
    const user = authenticateUser({ email, password, role, accessCode });
    req.session.user = { ...user, packagePlan: user.packagePlan || 'starter' };
    return res.json({ ok: true, user: { id: user.id, email: user.email, name: user.name, role: user.role, schoolName: user.schoolName, location: user.location, accessCode: user.accessCode, packagePlan: user.packagePlan || 'starter' } });
  } catch (error) {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    const user = mockUsers[email];
    if (user && user.password === password) {
      req.session.user = { id: user.id, email: user.email, name: user.name, role: user.role };
      return res.json({ ok: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    }
    return res.status(401).json({ ok: false, error: error.message || 'Invalid credentials.' });
  }
});

app.get('/api/auth/me', (req, res) => {
  if (!isAuthenticated(req)) {
    return res.status(401).json({ ok: false, error: 'Not signed in.' });
  }
  return res.json({ ok: true, user: req.session.user });
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.post('/api/schools/request', (req, res) => {
  try {
    const request = createSchoolAccessRequest(req.body || {});
    return res.json({ ok: true, request, message: 'School request received and queued for approval.' });
  } catch (error) {
    return res.status(400).json({ ok: false, error: error.message || 'Unable to create the school request.' });
  }
});

app.get('/api/schools', requireAuth, (_req, res) => {
  const schools = listSchools();
  return res.json({ ok: true, schools });
});

app.post('/api/admin/schools/approve', requireAuth, requireRole(['admin']), (req, res) => {
  try {
    const approved = approveSchoolAccess(req.body || {});
    return res.json({ ok: true, school: approved, message: 'School access approved and code activated.' });
  } catch (error) {
    return res.status(400).json({ ok: false, error: error.message || 'Unable to approve the school access request.' });
  }
});

app.post('/api/alerts/:id/read', requireAuth, async (req, res) => {
  const alertId = Number(req.params.id);
  if (!Number.isInteger(alertId)) return res.status(400).json({ error: 'Invalid alert ID.' });
  try {
    await query('UPDATE class_alerts SET read_at = CURRENT_TIMESTAMP WHERE id = ? AND school_id = ? AND (member_id IN (?, ?) OR member_id IS NULL)', [alertId, demoIds.schoolId, demoIds.studentId, demoIds.teacherId]);
    return res.json({ ok: true, persisted: true });
  } catch {
    return res.json({ ok: true, persisted: false });
  }
});

app.get('/api/bootstrap', requireAuth, async (req, res) => {
  try {
    if (!demoIds.schoolId) return res.json(fallbackBootstrap());
    const [[school]] = await query('SELECT name, school_code AS schoolCode, location FROM schools WHERE id = ?', [demoIds.schoolId]);
    const [classes] = await query('SELECT name, year_level AS yearLevel, subject_focus AS subjectFocus FROM classrooms WHERE school_id = ? ORDER BY id', [demoIds.schoolId]);
    const [members] = await query('SELECT full_name AS fullName, email, role FROM members WHERE school_id = ? ORDER BY id', [demoIds.schoolId]);
    const [[studentClass]] = await query('SELECT c.name FROM members m JOIN classrooms c ON c.id = m.classroom_id WHERE m.id = ?', [demoIds.studentId]);
    const [practicals] = await query('SELECT slug, subject, title, summary, duration_minutes AS durationMinutes, points FROM practicals ORDER BY id');
    const [rows] = await query(`SELECT a.id, a.title, a.subject, a.kind, a.instructions, a.due_at AS dueAt, a.question_count AS questionCount, a.timed, a.duration_minutes AS durationMinutes, a.questions_json AS questions, a.published, c.name AS classroomName
      FROM assessments a JOIN classrooms c ON c.id = a.classroom_id WHERE c.school_id = ? ORDER BY a.due_at IS NULL, a.due_at`, [demoIds.schoolId]);
    const [progressRows] = await query('SELECT COUNT(*) AS practicalsCompleted, COALESCE(SUM(points_awarded), 0) AS points FROM practical_progress WHERE student_id = ?', [demoIds.studentId]);
    const [completedRows] = await query('SELECT p.slug FROM practical_progress pp JOIN practicals p ON p.id = pp.practical_id WHERE pp.student_id = ?', [demoIds.studentId]);
    const [alertRows] = await query('SELECT id, title, body, alert_type AS type, read_at AS readAt, created_at AS createdAt FROM class_alerts WHERE school_id = ? ORDER BY created_at DESC LIMIT 8', [demoIds.schoolId]);
    const [submissionRows] = await query(`SELECT s.id, s.assessment_id AS assessmentId, m.full_name AS student, a.title, a.subject, c.name AS classroomName, s.score, s.feedback, s.status, s.submitted_at AS submittedAt, s.answers_json AS answers
      FROM submissions s JOIN members m ON m.id = s.student_id JOIN assessments a ON a.id = s.assessment_id JOIN classrooms c ON c.id = a.classroom_id WHERE c.school_id = ? ORDER BY s.submitted_at DESC LIMIT 12`, [demoIds.schoolId]);
    return res.json({
      connected: true,
      source: 'managed-db',
      school,
      classes,
      studentClassName: studentClass?.name || classes[0]?.name,
      members,
      practicals,
      assessments: rows.map((row) => ({ ...row, id: Number(row.id), dueAt: row.dueAt ? new Date(row.dueAt).toISOString() : null })),
      alerts: alertRows,
      submissions: submissionRows.map((row) => ({ ...row, id: Number(row.id), score: row.score === null ? null : Number(row.score) })),
      completedPracticals: completedRows.map((row) => row.slug),
      progress: { practicalsCompleted: Math.max(18, Number(progressRows[0]?.practicalsCompleted || 0)), totalPracticals: 24, points: 740 + Number(progressRows[0]?.points || 0), streakDays: 6 },
    });
  } catch (error) {
    console.error('Unable to load dashboard data:', error.message);
    return res.status(200).json({ ...fallbackBootstrap(), connected: false, source: 'sample' });
  }
});

app.post('/api/practicals/:slug/complete', requireAuth, async (req, res) => {
  const slug = String(req.params.slug || '').slice(0, 100);
  try {
    const [[practical]] = await query('SELECT id, title, points FROM practicals WHERE slug = ?', [slug]);
    if (!practical) return res.status(404).json({ error: 'Practical not found' });
    const [result] = await query('INSERT IGNORE INTO practical_progress (student_id, practical_id, points_awarded) VALUES (?, ?, ?)', [demoIds.studentId, practical.id, practical.points]);
    if (result.affectedRows) {
      await query('INSERT INTO class_alerts (school_id, member_id, title, body, alert_type) VALUES (?, ?, ?, ?, ?)', [demoIds.schoolId, demoIds.studentId, 'Practical completed', `${practical.title} · ${practical.points} points earned`, 'achievement']);
      if (Number(practical.points) >= 60) await query('INSERT IGNORE INTO achievements (student_id, achievement_slug) VALUES (?, ?)', [demoIds.studentId, 'curious-observer']);
    }
    return res.json({ ok: true, persisted: true, points: result.affectedRows ? Number(practical.points) : 0 });
  } catch {
    return res.json({ ok: true, persisted: false, points: 0 });
  }
});

app.post('/api/assessments', requireAuth, requireRole(['teacher', 'admin']), async (req, res) => {
  const { title, subject, kind = 'test', classroomName = 'SS2 Science A', instructions = '', dueAt = null, timed = false, durationMinutes = 0 } = req.body || {};
  if (!String(title || '').trim() || !String(subject || '').trim()) return res.status(400).json({ error: 'Assessment title and subject are required.' });
  const rawQuestions = Array.isArray(req.body?.questions) ? req.body.questions : [];
  if (rawQuestions.length < 1 || rawQuestions.length > 12) return res.status(400).json({ error: 'Add between one and twelve questions.' });
  const normalizedKind = ['exam', 'test', 'assignment'].includes(kind) ? kind : 'test';
  const questions = rawQuestions.map((question) => {
    const prompt = String(question?.prompt || '').trim().slice(0, 1000);
    if (!prompt) return null;
    if (normalizedKind === 'assignment') return { prompt, options: [], answer: null };
    const options = Array.isArray(question.options) ? question.options.map((option) => String(option).trim().slice(0, 300)) : [];
    const answer = Number(question.answer);
    if (options.length !== 4 || options.some((option) => !option) || !Number.isInteger(answer) || answer < 0 || answer > 3) return null;
    return { prompt, options, answer };
  });
  if (questions.some((question) => question === null)) return res.status(400).json({ error: 'Each question needs a prompt and, for tests or exams, four choices and a correct answer.' });
  try {
    const [[targetClass]] = await query('SELECT id, name FROM classrooms WHERE school_id = ? AND name = ?', [demoIds.schoolId, String(classroomName).slice(0, 120)]);
    if (!targetClass) return res.status(400).json({ error: 'Choose a class in this school.' });
    const classroomId = Number(targetClass.id);
    const [result] = await query(
      `INSERT INTO assessments (classroom_id, author_id, title, subject, kind, instructions, due_at, question_count, timed, duration_minutes, published, questions_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, ?)`,
      [classroomId, demoIds.teacherId, String(title).trim().slice(0, 180), String(subject).slice(0, 80), normalizedKind, String(instructions).slice(0, 5000), dueAt ? new Date(dueAt) : null, questions.length, normalizedKind !== 'assignment' && Boolean(timed), normalizedKind !== 'assignment' && timed ? Math.max(1, Math.min(240, Number(durationMinutes) || 20)) : 0, JSON.stringify(questions)],
    );
    await query('INSERT INTO class_alerts (school_id, member_id, title, body, alert_type) VALUES (?, NULL, ?, ?, ?)', [demoIds.schoolId, 'New assessment published', `${title} · ${subject}`, 'assessment_published']);
    return res.status(201).json({ ok: true, persisted: true, assessment: { id: Number(result.insertId), title, subject, kind: normalizedKind, classroomName: targetClass.name, instructions, dueAt, timed: normalizedKind !== 'assignment' && Boolean(timed), durationMinutes: Number(durationMinutes) || 0, questionCount: questions.length, questions, status: 'New' } });
  } catch (error) {
    console.error('Could not save assessment:', error.message);
    return res.status(503).json({ error: 'Assessment could not be saved right now.' });
  }
});

app.post('/api/assessments/:id/submissions', requireAuth, async (req, res) => {
  const assessmentId = Number(req.params.id);
  const answers = req.body?.answers && typeof req.body.answers === 'object' ? req.body.answers : {};
  try {
    const [[assessment]] = await query(`SELECT a.questions_json AS questions, a.title, a.subject FROM assessments a JOIN classrooms c ON c.id = a.classroom_id
      WHERE a.id = ? AND c.school_id = ? AND a.classroom_id = (SELECT classroom_id FROM members WHERE id = ?)`, [assessmentId, demoIds.schoolId, demoIds.studentId]);
    if (!assessment) return res.status(404).json({ error: 'Assessment not found' });
    const questions = Array.isArray(assessment.questions) ? assessment.questions : JSON.parse(assessment.questions || '[]');
    const gradable = questions.filter((question) => Number.isInteger(question.answer));
    const correct = gradable.filter((question, index) => Number(answers[index]) === question.answer).length;
    const score = gradable.length ? Math.round((correct / gradable.length) * 100) : null;
    await query(
      `INSERT INTO submissions (assessment_id, student_id, answers_json, score, status) VALUES (?, ?, ?, ?, 'submitted')
       ON DUPLICATE KEY UPDATE answers_json = VALUES(answers_json), score = VALUES(score), status = 'submitted', submitted_at = CURRENT_TIMESTAMP`,
      [assessmentId, demoIds.studentId, JSON.stringify(answers), score],
    );
    await query('INSERT INTO class_alerts (school_id, member_id, title, body, alert_type) VALUES (?, ?, ?, ?, ?)', [demoIds.schoolId, demoIds.teacherId, 'A student submitted work', `A response is ready for ${assessment.title || 'review'}.`, 'submission']);
    const [[submission]] = await query(`SELECT s.id, s.assessment_id AS assessmentId, s.score, s.feedback, s.status, s.submitted_at AS submittedAt, s.answers_json AS answers, m.full_name AS student, a.title, a.subject, c.name AS classroomName
      FROM submissions s JOIN members m ON m.id = s.student_id JOIN assessments a ON a.id = s.assessment_id JOIN classrooms c ON c.id = a.classroom_id WHERE s.assessment_id = ? AND s.student_id = ?`, [assessmentId, demoIds.studentId]);
    return res.json({ ok: true, persisted: true, score, correct, total: gradable.length, submission: { ...submission, id: Number(submission.id), score: submission.score === null ? null : Number(submission.score) } });
  } catch (error) {
    console.error('Could not save submission:', error.message);
    return res.status(503).json({ error: 'Submission could not be saved right now.' });
  }
});

app.post('/api/submissions/:id/review', requireAuth, requireRole(['teacher', 'admin']), async (req, res) => {
  const submissionId = Number(req.params.id);
  const score = Math.max(0, Math.min(100, Number(req.body?.score) || 0));
  const feedback = String(req.body?.feedback || '').slice(0, 5000);
  try {
    await query(`UPDATE submissions SET score = ?, feedback = ?, status = 'graded', reviewed_at = CURRENT_TIMESTAMP WHERE id = ?`, [score, feedback, submissionId]);
    await query('INSERT INTO class_alerts (school_id, member_id, title, body, alert_type) VALUES (?, ?, ?, ?, ?)', [demoIds.schoolId, demoIds.studentId, 'Your work has been graded', `A teacher reviewed your submission · ${score}%`, 'graded']);
    return res.json({ ok: true, persisted: true, score, feedback });
  } catch (error) {
    console.error('Could not save review:', error.message);
    return res.status(503).json({ error: 'Review could not be saved right now.' });
  }
});

app.post('/api/schools', requireAuth, requireRole(['admin']), async (req, res) => {
  const name = String(req.body?.name || '').trim().slice(0, 180);
  const location = String(req.body?.location || '').trim().slice(0, 180);
  if (name.length < 3) return res.status(400).json({ error: 'Enter a school name with at least three characters.' });
  const code = `${name.normalize('NFKD').replace(/[^a-z0-9]/gi, '').slice(0, 10).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
  try {
    const [schoolResult] = await query('INSERT INTO schools (school_code, name, location) VALUES (?, ?, ?)', [code, name, location]);
    const schoolId = Number(schoolResult.insertId);
    await query('INSERT INTO classrooms (school_id, name, year_level, subject_focus) VALUES (?, ?, ?, ?)', [schoolId, 'SS2 Science A', 'Senior secondary · Year 2', 'General Science']);
    const [[classroom]] = await query('SELECT id FROM classrooms WHERE school_id = ? AND name = ?', [schoolId, 'SS2 Science A']);
    const classroomId = Number(classroom.id);
    await query('INSERT INTO members (school_id, classroom_id, full_name, email, role) VALUES (?, ?, ?, ?, ?)', [schoolId, classroomId, 'Amara Owusu', `${code.toLowerCase()}-student@demo.labquest`, 'student']);
    await query('INSERT INTO members (school_id, classroom_id, full_name, email, role) VALUES (?, NULL, ?, ?, ?)', [schoolId, 'Mrs. Esi Boateng', `${code.toLowerCase()}-teacher@demo.labquest`, 'teacher']);
    const [[student]] = await query('SELECT id FROM members WHERE school_id = ? AND role = ?', [schoolId, 'student']);
    const [[teacher]] = await query('SELECT id FROM members WHERE school_id = ? AND role = ?', [schoolId, 'teacher']);
    demoIds.schoolId = schoolId;
    demoIds.classroomId = classroomId;
    demoIds.studentId = Number(student.id);
    demoIds.teacherId = Number(teacher.id);
    for (const assessment of sampleAssessments) {
      await query(
        `INSERT INTO assessments (classroom_id, author_id, title, subject, kind, instructions, due_at, question_count, timed, duration_minutes, published, questions_json)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, ?)`,
        [classroomId, demoIds.teacherId, assessment.title, assessment.subject, assessment.kind, assessment.instructions, assessment.dueAt.replace('T', ' '), assessment.questionCount, assessment.timed, assessment.durationMinutes, JSON.stringify(assessment.questions)],
      );
    }
    await query('INSERT INTO class_alerts (school_id, member_id, title, body, alert_type) VALUES (?, ?, ?, ?, ?)', [schoolId, demoIds.studentId, 'Your science workspace is ready', 'Explore the practical library and class activities.', 'school_created']);
    return res.status(201).json({ ok: true, persisted: true, school: { name, schoolCode: code, location } });
  } catch (error) {
    console.error('Could not create school:', error.message);
    return res.status(503).json({ error: 'School could not be registered right now.' });
  }
});

app.use('/api', (_req, res) => res.status(404).json({ error: 'API route not found.' }));

async function start() {
  const connected = await initializeDatabase();
  console.log(connected ? 'LabQuest database connected.' : 'LabQuest running with sample data; managed database is not connected.');
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist', { index: false }));
    app.use((_req, res) => res.sendFile('index.html', { root: 'dist' }));
  } else {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  }
  app.listen(port, '0.0.0.0', () => console.log(`LabQuest listening on ${port}`));
}

start().catch((error) => {
  console.error('LabQuest server failed to start:', error.message);
  process.exitCode = 1;
});

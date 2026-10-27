import { useEffect, useState } from 'react';
import { AlertCircle, Check, X } from 'lucide-react';
import { Sidebar, Header, NotificationPanel } from './components/Shell.jsx';
import { SchoolDialog, CreateAssessmentDialog } from './components/Dialogs.jsx';
import { DashboardPage, PracticalsPage, PracticalSessionPage, AssessmentsPage, QuizExperience, ProgressPage, ClassPage, ReviewPage } from './pages/Pages.jsx';
import { api } from './lib/api.js';
import { assessmentCatalog, initialAlerts, initialSubmissions, practicalCatalog } from './data/content.js';

const starter = {
  connected: false,
  source: 'sample',
  school: { name: 'Northstar Science Academy', schoolCode: 'NORTHSTAR24', location: 'Accra, Ghana' },
  classes: [{ name: 'SS2 Science A', yearLevel: 'Senior secondary · Year 2', subjectFocus: 'General Science' }],
  progress: { practicalsCompleted: 18, totalPracticals: 24, points: 740, streakDays: 6 },
};

export default function App() {
  const [role, setRole] = useState('student');
  const [view, setView] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bootstrap, setBootstrap] = useState(starter);
  const [assessments, setAssessments] = useState(assessmentCatalog);
  const [alerts, setAlerts] = useState(initialAlerts);
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [completed, setCompleted] = useState([]);
  const [points, setPoints] = useState(740);
  const [selectedPractical, setSelectedPractical] = useState(null);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [schoolDialog, setSchoolDialog] = useState(false);
  const [createDialog, setCreateDialog] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let alive = true;
    api.bootstrap().then((result) => {
      if (!alive || !result || result.ok === false) return;
      setBootstrap((current) => ({ ...current, ...result }));
      if (result.assessments?.length) setAssessments((current) => mergeAssessments(current, result.assessments, result.submissions || []));
      if (result.alerts?.length) setAlerts(result.alerts.map((item) => ({ ...item, unread: !item.readAt, time: item.time || timeAgo(item.createdAt) })));
      if (result.submissions?.length) setSubmissions(result.submissions.map(mapSubmission));
      if (Array.isArray(result.completedPracticals)) setCompleted(result.completedPracticals);
      if (result.progress) setPoints(Math.max(740, Number(result.progress.points) || 740));
    });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 4200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const notify = (title, message, tone = 'success') => setToast({ title, message, tone });
  const goTo = (nextView) => { setSelectedPractical(null); setSelectedAssessment(null); setView(nextView); };
  const openPractical = (practical) => { const match = practicalCatalog.find((item) => item.slug === practical.slug) || practicalCatalog[0]; setSelectedPractical(match); setSelectedAssessment(null); setView('practical-session'); };
  const startAssessment = (assessment) => { setSelectedAssessment(assessment); setView('quiz'); };

  const completePractical = async (practical) => {
    const alreadyDone = completed.includes(practical.slug);
    if (!alreadyDone) {
      setCompleted((current) => [...current, practical.slug]);
      setPoints((current) => current + practical.points);
      setAlerts((current) => [{ id: `local-${Date.now()}`, title: 'Practical completed', body: `${practical.title} · ${practical.points} points earned`, unread: true, time: 'Just now' }, ...current]);
      const saved = await api.completePractical(practical.slug);
      notify('Another discovery unlocked', `You earned ${practical.points} science points${saved.persisted ? ' and your progress was saved.' : '.'}`);
    } else notify('Nice review', 'You can revisit a practical whenever you want.');
    setSelectedPractical(null);
    setView('dashboard');
  };

  const publishAssessment = async (assessment) => {
    const response = await api.createAssessment(assessment);
    const saved = response.assessment || { ...assessment, id: `local-${Date.now()}`, status: 'New' };
    setAssessments((current) => [saved, ...current]);
    setAlerts((current) => [{ id: `local-${Date.now()}`, title: 'New assessment published', body: `${saved.title} · ${saved.subject}`, unread: true, time: 'Just now' }, ...current]);
    notify(`Published to ${saved.classroomName || 'SS2 Science A'}`, response.persisted ? 'Class activity and alert saved to the learning data layer.' : 'Added to the demo workspace. Live persistence is not connected.');
  };

  const submitAssessment = async (assessment, answers, score) => {
    const result = await api.submitAssessment(assessment.id || assessment.slug || 0, answers);
    const finalScore = score ?? result.score;
    setAssessments((current) => current.map((item) => (item.id === assessment.id ? { ...item, status: 'Submitted', score: finalScore } : item)));
    if (result.submission) setSubmissions((current) => [mapSubmission(result.submission), ...current.filter((item) => item.id !== result.submission.id)]);
    setAlerts((current) => [{ id: `local-${Date.now()}`, title: 'Assessment submitted', body: `${assessment.title} · ready for teacher review`, unread: true, time: 'Just now' }, ...current]);
    return { ...result, score: score ?? result.score, persisted: result.persisted };
  };

  const reviewWork = async (id, review) => {
    const response = await api.reviewSubmission(id, review);
    setSubmissions((current) => current.map((item) => item.id === id ? { ...item, ...review, status: 'Graded' } : item));
    notify('Feedback saved', response.persisted ? 'The graded work and student alert were saved.' : 'Grade saved to the demo view.');
  };

  const saveSchool = async (school) => {
    if (!school.joined) {
      const response = await api.createSchool(school);
      if (response.school) {
        setBootstrap((current) => ({ ...current, school: response.school }));
        if (response.persisted) {
          const refreshed = await api.bootstrap();
          if (refreshed?.connected) {
            setBootstrap((current) => ({ ...current, ...refreshed }));
            if (refreshed.assessments?.length) setAssessments(mergeAssessments(assessmentCatalog, refreshed.assessments, refreshed.submissions || []));
            if (refreshed.alerts?.length) setAlerts(refreshed.alerts.map((item) => ({ ...item, unread: !item.readAt, time: item.time || timeAgo(item.createdAt) })));
            if (refreshed.submissions?.length) setSubmissions(refreshed.submissions.map(mapSubmission));
            if (Array.isArray(refreshed.completedPracticals)) setCompleted(refreshed.completedPracticals);
          }
        }
      } else setBootstrap((current) => ({ ...current, school }));
      notify('School workspace created', response.persisted ? 'The school record was saved.' : 'Created in this demo session.');
    } else {
      setBootstrap((current) => ({ ...current, school: { ...current.school, schoolCode: school.schoolCode } }));
      notify('Join request noted', 'School invite verification is not connected in this prototype.');
    }
  };

  const markRead = (id) => {
    setAlerts((current) => current.map((item) => item.id === id ? { ...item, unread: false } : item));
    if (Number.isInteger(Number(id))) api.markAlertRead(id);
  };
  const studentClass = bootstrap.studentClassName || bootstrap.classes?.[0]?.name;
  const visibleAssessments = role === 'teacher' ? assessments : assessments.filter((item) => item.classroomName === studentClass || (!bootstrap.connected && !item.classroomName));
  const page = selectedPractical ? <PracticalSessionPage practical={selectedPractical} completed={completed.includes(selectedPractical.slug)} onBack={() => goTo('practicals')} onComplete={completePractical} />
    : view === 'quiz' && selectedAssessment ? <QuizExperience assessment={selectedAssessment} onExit={() => goTo('assessments')} onSubmit={submitAssessment} />
      : view === 'dashboard' ? <DashboardPage role={role} bootstrap={bootstrap} assessments={visibleAssessments} completed={completed} points={points} onNavigate={goTo} onOpenPractical={openPractical} onStartAssessment={startAssessment} onCreate={() => setCreateDialog(true)} />
        : view === 'practicals' ? <PracticalsPage role={role} completed={completed} onOpenPractical={openPractical} />
          : view === 'assessments' ? <AssessmentsPage role={role} assessments={visibleAssessments} onStart={startAssessment} onCreate={() => setCreateDialog(true)} />
            : view === 'progress' ? <ProgressPage role={role} points={points} completed={completed} />
              : view === 'class' ? <ClassPage role={role} school={bootstrap.school} onSchool={() => setSchoolDialog(true)} />
                : view === 'review' && role === 'teacher' ? <ReviewPage classes={bootstrap.classes || []} submissions={submissions} onSave={reviewWork} />
                  : <DashboardPage role={role} bootstrap={bootstrap} assessments={visibleAssessments} completed={completed} points={points} onNavigate={goTo} onOpenPractical={openPractical} onStartAssessment={startAssessment} onCreate={() => setCreateDialog(true)} />;

  return <div className="app-shell"><Sidebar active={view === 'practical-session' ? 'practicals' : view === 'quiz' ? 'assessments' : view} role={role} setRole={setRole} setActive={goTo} school={bootstrap.school} onSchool={() => setSchoolDialog(true)} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
    <main className="main-shell"><div className="public-demo-notice" role="note"><strong>PUBLIC SAMPLE DEMO</strong><span>Use fictional details only. This prototype has no secure sign-in or school permissions; do not enter real student information.</span></div><Header role={role} school={bootstrap.school} alerts={alerts} onNotifications={() => setNotificationOpen(true)} onSchool={() => setSchoolDialog(true)} onMenu={() => setMobileOpen(true)} onCreate={() => setCreateDialog(true)} /><div className="workspace-content">{page}</div></main>
    {notificationOpen && <NotificationPanel alerts={alerts} onClose={() => setNotificationOpen(false)} onMarkRead={markRead} />}
    {schoolDialog && <SchoolDialog school={bootstrap.school} onClose={() => setSchoolDialog(false)} onSave={saveSchool} />}
    {createDialog && <CreateAssessmentDialog classes={bootstrap.classes || []} onClose={() => setCreateDialog(false)} onCreate={publishAssessment} />}
    {toast && <div className={`toast toast--${toast.tone}`} role="status"><span className="toast-icon">{toast.tone === 'error' ? <AlertCircle size={17} /> : <Check size={17} />}</span><span><strong>{toast.title}</strong><small>{toast.message}</small></span><button onClick={() => setToast(null)} aria-label="Dismiss"><X size={16} /></button></div>}
    <div className="data-status" title={bootstrap.connected ? 'Connected to the managed database' : 'Sample data / prototype mode'}><i className={bootstrap.connected ? 'online' : ''} />{bootstrap.connected ? 'Managed data' : 'Demo data'}</div>
  </div>;
}

function mergeAssessments(current, incoming, submissions = []) {
  const merged = incoming.map((item) => {
    const submission = submissions.find((entry) => (entry.assessmentId != null && item.id != null && String(entry.assessmentId) === String(item.id)) || (entry.title === item.title && entry.classroomName === item.classroomName && Boolean(item.classroomName)));
    const graded = submission?.status === 'graded' || submission?.status === 'Graded';
    return { ...item, status: item.published === false ? 'Draft' : submission ? (graded ? 'Graded' : 'Submitted') : item.status || 'Due soon', score: submission?.score ?? item.score, feedback: submission?.feedback || item.feedback, questions: Array.isArray(item.questions) ? item.questions : [] };
  });
  for (const item of current) if (!merged.some((entry) => entry.title === item.title)) merged.push(item);
  return merged;
}

function mapSubmission(item) {
  return { ...item, initials: item.student?.split(' ').map((part) => part[0]).join('').slice(0, 2), status: item.status === 'graded' ? 'Graded' : 'Needs review', submitted: item.submittedAt ? timeAgo(item.submittedAt) : 'Recently submitted', response: item.response || answerText(item.answers) };
}

function answerText(answers) {
  let value = answers;
  if (typeof value === 'string') {
    try { value = JSON.parse(value); } catch { return value; }
  }
  if (Array.isArray(value)) return value.map(String).join(' ');
  if (value && typeof value === 'object') return Object.values(value).map((answer) => typeof answer === 'string' ? answer : JSON.stringify(answer)).join(' ');
  return 'Response submitted for teacher review.';
}

function timeAgo(value) {
  if (!value) return 'Recently';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';
  const minutes = Math.max(1, Math.floor((Date.now() - date.getTime()) / 60000));
  if (minutes < 60) return `${minutes} min ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)} hr ago`;
  return `${Math.floor(minutes / 1440)} day${Math.floor(minutes / 1440) > 1 ? 's' : ''} ago`;
}

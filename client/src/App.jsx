import { useEffect, useState } from 'react';
import { AlertCircle, Check, X } from 'lucide-react';
import { Sidebar, Header, NotificationPanel } from './components/Shell.jsx';
import { SchoolDialog, CreateAssessmentDialog, DeveloperAccessDialog } from './components/Dialogs.jsx';
import { DashboardPage, PracticalsPage, PracticalSessionPage, AssessmentsPage, QuizExperience, ProgressPage, ClassPage, ReviewPage, OwnerDashboardPage } from './pages/Pages.jsx';
import HomePage from './pages/HomePage.jsx';
import { api } from './lib/api.js';
import { assessmentCatalog, initialAlerts, initialSubmissions, practicalCatalog } from './data/content.js';

const starter = {
  connected: false,
  source: 'sample',
  school: { name: 'Northstar Science Academy', schoolCode: 'NORTHSTAR24', location: 'Accra, Ghana' },
  classes: [{ name: 'SS2 Science A', yearLevel: 'Senior secondary · Year 2', subjectFocus: 'General Science' }],
  progress: { practicalsCompleted: 18, totalPracticals: 24, points: 740, streakDays: 6 },
};

const demoSchoolAccess = [
  { id: 'school-01', name: 'Northstar Science Academy', code: 'LABQUESTDEV', accessType: 'school-admin', status: 'Active', region: 'Accra, Ghana', members: 128, lastAccess: '2 hours ago' },
  { id: 'school-02', name: 'Lighthouse Girls College', code: 'LABQUEST-DEV', accessType: 'teacher', status: 'Active', region: 'Kumasi', members: 84, lastAccess: '5 hours ago' },
  { id: 'school-03', name: 'Apex STEM Academy', code: 'NORTHSTAR2026', accessType: 'student', status: 'Pending', region: 'Cape Coast', members: 36, lastAccess: '1 day ago' },
];

const ADMIN_ROUTES = new Set(['/admin', '/school-admin', '/secret-portal']);
const getCurrentRoute = () => window.location.pathname.toLowerCase();
const defaultAccounts = [
  { id: 'demo-admin', email: 'admin@labquest.edu.ng', password: 'LabQuest2026!', role: 'admin', accessCode: 'LABQUEST-ADMIN', name: 'LabQuest Admin', schoolName: 'LabQuest HQ', location: 'Lagos, Nigeria' },
  { id: 'demo-teacher', email: 'teacher@labquest.edu.ng', password: 'LabQuest2026!', role: 'teacher', accessCode: 'LABQUEST-TEACHER', name: 'Mrs. Esi Boateng', schoolName: 'Northstar Science Academy', location: 'Accra, Ghana' },
  { id: 'demo-student', email: 'student@labquest.edu.ng', password: 'LabQuest2026!', role: 'student', accessCode: 'LABQUEST-STUDENT', name: 'Amara Owusu', schoolName: 'Northstar Science Academy', location: 'Accra, Ghana' },
];

export default function App() {
  const [role, setRole] = useState('student');
  const [view, setView] = useState('landing');
  const [auth, setAuth] = useState(null);
  const [registeredUsers, setRegisteredUsers] = useState(defaultAccounts);
  const [appOwnerMode, setAppOwnerMode] = useState(false);
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
  const [developerDialog, setDeveloperDialog] = useState(false);
  const [ownerAccess, setOwnerAccess] = useState(demoSchoolAccess);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let alive = true;
    api.me().then((result) => {
      if (!alive) return;
      if (!result || !result.ok || !result.user) {
        setAuth(null);
        return;
      }
      setAuth(result.user);
      setRole(result.user.role || 'student');
    });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!auth) return undefined;
    let alive = true;
    if (auth.role === 'admin') {
      api.listSchools().then((result) => {
        if (!alive || !result || result.ok === false) return;
        setOwnerAccess(Array.isArray(result.schools) ? result.schools : []);
      });
    }
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
  }, [auth]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 4200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const route = getCurrentRoute();
    const isAdminRoute = ADMIN_ROUTES.has(route);
    if (isAdminRoute) {
      setView('admin');
      if (auth) setRole(auth.role || 'admin');
      return;
    }
    if (auth && route !== '/') {
      window.history.replaceState({}, '', '/');
    }
    if (auth && view === 'landing') {
      setView('dashboard');
      setRole(auth.role || 'student');
    }
  }, [auth, view]);

  const setRoute = (route) => {
    const nextPath = route === 'landing' ? '/' : route.startsWith('/') ? route : `/${route}`;
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
    }
    const isAdminRoute = ADMIN_ROUTES.has(nextPath);
    setView(isAdminRoute ? 'admin' : route);
  };

  const generateAccessCode = (schoolName = 'LABQUEST') => {
    const prefix = String(schoolName || 'LABQUEST').replace(/[^a-zA-Z0-9]/g, '').slice(0, 5).toUpperCase() || 'LABQ';
    const numeric = String(Date.now() % 9000 + 1000);
    return `${prefix}-${numeric}`;
  };

  const requestSchoolAccess = async ({ schoolName, location, email }) => {
    const cleanedName = String(schoolName || '').trim();
    if (!cleanedName) {
      notify('School request incomplete', 'Enter your school name so the developer can review access.', 'error');
      return false;
    }

    const response = await api.requestSchoolAccess({ schoolName: cleanedName, location, email, accessType: 'school-admin' });
    if (!response || !response.ok || !response.request) {
      notify('School request failed', response?.error || 'The request could not be submitted.', 'error');
      return false;
    }

    setOwnerAccess((current) => [response.request, ...current]);
    notify('School access requested', `Your request was received. Share access code ${response.request.code} with the school admin when approved.`, 'success');
    return true;
  };

  const notify = (title, message, tone = 'success') => setToast({ title, message, tone });
  const registerAccount = async ({ role: selectedRole, email, password, confirmPassword, accessCode, schoolName, schoolEmail, location, plan }) => {
    const normalizedRole = selectedRole === 'school-admin' ? 'admin' : selectedRole === 'teacher' ? 'teacher' : 'student';
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedPassword = String(password || '');
    const normalizedConfirm = String(confirmPassword || '');
    const normalizedAccessCode = String(accessCode || '').trim();
    if (!normalizedEmail || !normalizedPassword || normalizedPassword !== normalizedConfirm) {
      notify('Registration incomplete', 'Please complete all required fields and confirm the password matches.', 'error');
      return false;
    }
    if (normalizedRole !== 'admin' && !normalizedAccessCode) {
      notify('School access code required', 'Student and teacher accounts need a valid school access code.', 'error');
      return false;
    }
    if (normalizedRole === 'admin' && !String(schoolName || '').trim()) {
      notify('School name required', 'Add your school name to continue with school-admin registration.', 'error');
      return false;
    }

    const response = await api.register({
      role: normalizedRole,
      email: normalizedEmail,
      password: normalizedPassword,
      confirmPassword: normalizedConfirm,
      accessCode: normalizedAccessCode,
      schoolName: String(schoolName || '').trim(),
      schoolEmail: String(schoolEmail || normalizedEmail).trim(),
      location: String(location || '').trim(),
      plan: String(plan || 'starter').trim(),
    });

    if (!response || !response.ok) {
      notify('Registration failed', response?.error || 'The registration could not be completed.', 'error');
      return false;
    }

    setRegisteredUsers((current) => [{ id: response.user.id, email: response.user.email, password: normalizedPassword, role: response.user.role, accessCode: response.user.accessCode, name: response.user.name, schoolName: response.user.schoolName, location: response.user.location }, ...current.filter((item) => item.email !== normalizedEmail)]);
    notify('Check your email for your access code', `${normalizedRole === 'admin' ? 'School admin' : normalizedRole === 'teacher' ? 'Teacher' : 'Student'} registration is complete. If you already have an access code, sign in below to continue.`, 'success');
    return true;
  };

  const login = async ({ email, password, accessCode, role: selectedRole }) => {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedPassword = String(password || '');
    const normalizedRole = selectedRole === 'school-admin' ? 'admin' : selectedRole === 'teacher' ? 'teacher' : 'student';
    const normalizedAccessCode = String(accessCode || '').trim();

    const localUser = registeredUsers.find((user) => user.email.toLowerCase() === normalizedEmail && user.password === normalizedPassword && (!normalizedAccessCode || user.accessCode === normalizedAccessCode || user.role === normalizedRole));
    if (localUser) {
      setAuth({ id: localUser.id, email: localUser.email, name: localUser.name, role: localUser.role, schoolName: localUser.schoolName, location: localUser.location });
      setRole(localUser.role);
      setView(localUser.role === 'admin' ? 'admin' : 'dashboard');
      notify('Welcome back', `Signed in as ${localUser.name}.`, 'success');
      return true;
    }

    const result = await api.login(normalizedEmail, normalizedPassword, normalizedRole, normalizedAccessCode);
    if (!result || !result.ok || !result.user) {
      notify('Sign-in failed', result?.error || 'Use the LabQuest credentials to open the secure workspace.', 'error');
      return false;
    }
    setAuth(result.user);
    setRole(result.user.role || normalizedRole);
    setView(result.user.role === 'admin' ? 'admin' : 'dashboard');
    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
    }
    notify('Welcome back', `Signed in as ${result.user.name}.`, 'success');
    return true;
  };
  const logout = async () => {
    await api.logout();
    setAuth(null);
    setRole('student');
    window.history.pushState({}, '', '/');
    setView('landing');
    notify('Signed out', 'You have been returned to the public landing page.', 'info');
  };
  const goTo = (nextView) => { setSelectedPractical(null); setSelectedAssessment(null); setView(nextView); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const grantDeveloperAccess = async ({ schoolName, schoolCode, accessType }) => {
    const cleanedName = String(schoolName || '').trim();
    const accessKey = String(schoolCode || '').trim().toUpperCase() || generateAccessCode(cleanedName);
    const typeMap = { 'school-admin': 'admin', teacher: 'teacher', student: 'student' };
    if (!cleanedName) {
      notify('Access code rejected', 'Use a valid school name to authorize access.', 'error');
      return;
    }

    const response = await api.approveSchoolAccess({ schoolName: cleanedName, schoolCode: accessKey, accessType });
    if (!response || !response.ok) {
      notify('Approval failed', response?.error || 'The school could not be approved.', 'error');
      return;
    }

    const ownerRecord = response.school || {
      id: `school-${Date.now()}`,
      name: cleanedName,
      code: accessKey,
      accessType,
      status: 'Active',
      region: 'Approved',
      members: 1,
      lastAccess: 'Just now',
    };
    setOwnerAccess((current) => {
      const existingIndex = current.findIndex((item) => item.name === cleanedName || item.code === ownerRecord.code);
      const nextList = [...current];
      if (existingIndex >= 0) {
        nextList[existingIndex] = { ...nextList[existingIndex], ...ownerRecord, status: 'Active', accessType: ownerRecord.accessType || accessType, code: ownerRecord.code || accessKey, lastAccess: 'Just now' };
      } else {
        nextList.unshift(ownerRecord);
      }
      return nextList;
    });
    setBootstrap((current) => ({ ...current, school: { ...current.school, name: cleanedName, schoolCode: accessKey } }));
    setRole(typeMap[accessType] || 'admin');
    setDeveloperDialog(false);
    setView('dashboard');
    notify('Developer access granted', `${cleanedName} has been assigned ${accessType === 'school-admin' ? 'school-admin' : accessType === 'teacher' ? 'teacher' : 'student'} permissions. Access code: ${accessKey}.`, 'success');
  };
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

  const signedIn = Boolean(auth);
  const isAdminRoute = ADMIN_ROUTES.has(getCurrentRoute());
  const authorizedRole = auth?.role || role;

  if (isAdminRoute && !signedIn) {
    return <AuthScreen onSubmit={login} onRegister={registerAccount} onCancel={() => { window.history.pushState({}, '', '/'); setView('landing'); }} />;
  }

  if (view === 'landing') return <HomePage
    onOpenDashboard={(nextRole = 'student') => {
      if (!auth) {
        window.history.pushState({}, '', '/admin');
        setView('admin');
        return;
      }
      setRole(nextRole);
      setAppOwnerMode(false);
      setView('dashboard');
      window.history.pushState({}, '', '/');
    }}
    onOpenSignIn={() => {
      window.history.pushState({}, '', '/admin');
      setView('admin');
    }}
  />;
  const studentClass = bootstrap.studentClassName || bootstrap.classes?.[0]?.name;
  const visibleAssessments = authorizedRole === 'teacher' || authorizedRole === 'admin' ? assessments : assessments.filter((item) => item.classroomName === studentClass || (!bootstrap.connected && !item.classroomName));
  const page = appOwnerMode || authorizedRole === 'admin'
    ? <OwnerDashboardPage schools={ownerAccess} onBack={() => { setRole('student'); setAppOwnerMode(false); setView('landing'); window.history.pushState({}, '', '/'); }} onGrant={grantDeveloperAccess} />
    : selectedPractical ? <PracticalSessionPage practical={selectedPractical} completed={completed.includes(selectedPractical.slug)} onBack={() => goTo('practicals')} onComplete={completePractical} />
      : view === 'quiz' && selectedAssessment ? <QuizExperience assessment={selectedAssessment} onExit={() => goTo('assessments')} onSubmit={submitAssessment} />
        : view === 'dashboard' ? <DashboardPage role={authorizedRole} bootstrap={bootstrap} assessments={visibleAssessments} completed={completed} points={points} onNavigate={goTo} onOpenPractical={openPractical} onStartAssessment={startAssessment} onCreate={() => setCreateDialog(true)} />
          : view === 'practicals' ? <PracticalsPage role={authorizedRole} completed={completed} onOpenPractical={openPractical} />
            : view === 'assessments' ? <AssessmentsPage role={authorizedRole} assessments={visibleAssessments} onStart={startAssessment} onCreate={() => setCreateDialog(true)} />
              : view === 'progress' ? <ProgressPage role={authorizedRole} points={points} completed={completed} />
                : view === 'class' ? <ClassPage role={authorizedRole} school={bootstrap.school} onSchool={() => setSchoolDialog(true)} />
                  : view === 'review' && (authorizedRole === 'teacher' || authorizedRole === 'admin') ? <ReviewPage classes={bootstrap.classes || []} submissions={submissions} onSave={reviewWork} />
                    : <DashboardPage role={authorizedRole} bootstrap={bootstrap} assessments={visibleAssessments} completed={completed} points={points} onNavigate={goTo} onOpenPractical={openPractical} onStartAssessment={startAssessment} onCreate={() => setCreateDialog(true)} />;

  return <div className="app-shell"><Sidebar active={view === 'practical-session' ? 'practicals' : view === 'quiz' ? 'assessments' : view} role={authorizedRole === 'owner' ? 'admin' : authorizedRole} setRole={(nextRole) => { setRole(nextRole); setAppOwnerMode(nextRole === 'owner'); }} setActive={(nextView) => { setAppOwnerMode(false); goTo(nextView); }} school={bootstrap.school} onSchool={() => setSchoolDialog(true)} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
    <main className="main-shell"><Header role={authorizedRole === 'owner' ? 'admin' : authorizedRole} school={bootstrap.school} alerts={alerts} onNotifications={() => setNotificationOpen(true)} onSchool={() => setSchoolDialog(true)} onMenu={() => setMobileOpen(true)} onCreate={() => setCreateDialog(true)} onHome={() => { setAppOwnerMode(false); setRole('student'); setView('landing'); window.history.pushState({}, '', '/'); }} onLogout={logout} /><div className="workspace-content">{page}</div></main>
    {notificationOpen && <NotificationPanel alerts={alerts} onClose={() => setNotificationOpen(false)} onMarkRead={markRead} />}
    {schoolDialog && <SchoolDialog school={bootstrap.school} onClose={() => setSchoolDialog(false)} onSave={saveSchool} />}
    {createDialog && <CreateAssessmentDialog classes={bootstrap.classes || []} onClose={() => setCreateDialog(false)} onCreate={publishAssessment} />}
    {developerDialog && <DeveloperAccessDialog onClose={() => setDeveloperDialog(false)} onGrant={grantDeveloperAccess} />}
    {toast && <div className={`toast toast--${toast.tone}`} role="status"><span className="toast-icon">{toast.tone === 'error' ? <AlertCircle size={17} /> : <Check size={17} />}</span><span><strong>{toast.title}</strong><small>{toast.message}</small></span><button onClick={() => setToast(null)} aria-label="Dismiss"><X size={16} /></button></div>}
    <div className="data-status" title={bootstrap.connected ? 'Connected to the managed database' : 'Protected workspace with local sample data'}><i className={bootstrap.connected ? 'online' : ''} />{auth ? 'Secure session' : 'Open dashboard'}</div>
  </div>;
}

function AuthScreen({ onSubmit, onRegister, onCancel }) {
  const [mode, setMode] = useState('signin');
  const [accountType, setAccountType] = useState('student');
  const [email, setEmail] = useState('student@labquest.edu.ng');
  const [password, setPassword] = useState('LabQuest2026!');
  const [confirmPassword, setConfirmPassword] = useState('LabQuest2026!');
  const [accessCode, setAccessCode] = useState('LABQUEST-STUDENT');
  const [schoolName, setSchoolName] = useState('');
  const [schoolEmail, setSchoolEmail] = useState('');
  const [location, setLocation] = useState('');
  const [plan, setPlan] = useState('starter');
  const [registrationNotice, setRegistrationNotice] = useState(false);

  const handleSubmit = async (event) => {
    if (event) event.preventDefault();
    if (mode === 'register') {
      const ok = await onRegister({
        role: accountType,
        email,
        password,
        confirmPassword,
        accessCode,
        schoolName,
        schoolEmail,
        location,
        plan,
      });
      if (ok) {
        setMode('signin');
        setRegistrationNotice(true);
        setPassword('');
        setConfirmPassword('');
      }
      return;
    }
    setRegistrationNotice(false);
    onSubmit({ email, password, accessCode, role: accountType });
  };

  return <div className="auth-screen"><div className="auth-panel"><div className="auth-badge">SECURE PORTAL</div><h1>{mode === 'register' ? 'Register' : 'Sign in'}</h1><p>{mode === 'register' ? 'Create a learning account for your student, teacher, or school-admin role.' : 'Access the protected classroom dashboard for your assigned role.'}</p><div className="auth-mode-switcher"><button type="button" className={mode === 'signin' ? 'active' : ''} onClick={() => { setMode('signin'); setRegistrationNotice(false); }}>Sign in</button><button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => { setMode('register'); setRegistrationNotice(false); }}>Register</button></div>
      <div className="auth-role-switcher"><button type="button" className={accountType === 'student' ? 'active' : ''} onClick={() => setAccountType('student')}>Student</button><button type="button" className={accountType === 'teacher' ? 'active' : ''} onClick={() => setAccountType('teacher')}>Teacher</button><button type="button" className={accountType === 'school-admin' ? 'active' : ''} onClick={() => setAccountType('school-admin')}>School admin</button></div>
      {registrationNotice && mode === 'signin' && <div className="auth-inline-note auth-inline-note--success" style={{ marginBottom: '1rem' }}>Check your email for your access code. Your registration is complete — sign in below when you are ready.</div>}
      <form onSubmit={handleSubmit} className="auth-form">
        {mode === 'register' && accountType === 'school-admin' ? <>
          <label><span>School name</span><input value={schoolName} onChange={(event) => setSchoolName(event.target.value)} placeholder="Northstar Science Academy" /></label>
          <label><span>School email</span><input type="email" value={schoolEmail || email} onChange={(event) => setSchoolEmail(event.target.value)} placeholder="admin@school.edu" /></label>
          <label><span>Password</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
          <label><span>Confirm password</span><input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /></label>
          <label><span>Address / location</span><input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Accra, Ghana" /></label>
          <label><span>Access pack</span><select value={plan} onChange={(event) => setPlan(event.target.value)}><option value="starter">Starter pack</option><option value="premium">Premium pack</option><option value="full">Full access</option></select></label>
        </> : <>
          {mode === 'register' && <label><span>Email</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label>}
          {mode === 'signin' && <label><span>Email</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label>}
          {mode === 'register' ? <><label><span>Password</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label><label><span>Confirm password</span><input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /></label></> : <><label><span>Password</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label></>}
          <label><span>School access code</span><input value={accessCode} onChange={(event) => setAccessCode(event.target.value)} placeholder="LABQUEST-STUDENT" /></label>
        </>}
        {mode === 'signin' && <div className="auth-inline-note">Select your role before signing in and use the matching access code.</div>}
        <div className="auth-actions"><button type="button" className="button button--outline" onClick={onCancel}>Back</button><button type="submit" className="button button--primary" onClick={(event) => { event.preventDefault(); handleSubmit(event); }}>{mode === 'register' ? 'Register' : 'Sign in'}</button></div>
      </form></div></div>;
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
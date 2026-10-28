import { Activity, Atom, Bell, BookOpenCheck, ChevronDown, FlaskConical, Home, Leaf, LibraryBig, LogOut, Menu, Microscope, Plus, School, Sparkles, Sprout, Trophy, Users, X } from 'lucide-react';

const navStudent = [
  { id: 'dashboard', label: 'Overview', icon: Home, section: 'LEARNING' },
  { id: 'practicals', label: 'Practical lab', icon: FlaskConical },
  { id: 'assessments', label: 'Assessments', icon: BookOpenCheck, badge: '2' },
  { id: 'progress', label: 'My progress', icon: Trophy },
  { id: 'class', label: 'My class', icon: Users, section: 'COMMUNITY' },
];
const navTeacher = [
  { id: 'dashboard', label: 'Overview', icon: Home, section: 'TEACHING' },
  { id: 'practicals', label: 'Practical library', icon: LibraryBig },
  { id: 'assessments', label: 'Assessment desk', icon: BookOpenCheck },
  { id: 'review', label: 'Review work', icon: Microscope, badge: '6' },
  { id: 'progress', label: 'Class progress', icon: Activity },
  { id: 'class', label: 'My classes', icon: Users, section: 'SCHOOL' },
];
const navAdmin = [
  { id: 'dashboard', label: 'School overview', icon: Home, section: 'CONTROL' },
  { id: 'class', label: 'Lab operations', icon: School },
  { id: 'practicals', label: 'Practical catalog', icon: LibraryBig },
  { id: 'assessments', label: 'Assessments', icon: BookOpenCheck },
  { id: 'review', label: 'Quality review', icon: Microscope },
  { id: 'progress', label: 'School analytics', icon: Activity, section: 'REPORTS' },
];

export function BrandMark({ compact = false }) {
  return <div className={`brand-lockup ${compact ? 'brand-lockup--compact' : ''}`}>
    <span className="brand-mark"><svg viewBox="0 0 34 34" fill="none" aria-hidden="true"><path d="M13 5h8M15 5v9.3L8.5 25.5A3.2 3.2 0 0 0 11.3 30h11.4a3.2 3.2 0 0 0 2.8-4.5L19 14.3V5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M11.3 23h11.4M15 18.2l1.8-3.1M22.7 23l-2.9-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="22.8" cy="10.2" r="1.25" fill="#f0b74b"/></svg></span>
    {!compact && <span className="brand-word">labquest<span className="brand-period">.</span><small>SCIENCE IN ACTION</small></span>}
  </div>;
}

export function Avatar({ initials = 'AO', tone = 'green', size = '' }) {
  return <span className={`avatar avatar--${tone} ${size ? `avatar--${size}` : ''}`}>{initials}</span>;
}

export function Sidebar({ active, role, setRole, setActive, school, onSchool, mobileOpen, setMobileOpen }) {
  const entries = role === 'teacher' ? navTeacher : role === 'admin' ? navAdmin : navStudent;
  const profile = role === 'teacher' ? { name: 'Mrs. Esi Boateng', caption: 'Science teacher', initials: 'EB' } : role === 'admin' ? { name: 'Mariam Okafor', caption: 'School admin', initials: 'MO' } : { name: 'Amara Owusu', caption: 'Senior student · SS2', initials: 'AO' };
  return <>
    {mobileOpen && <button className="mobile-scrim" onClick={() => setMobileOpen(false)} aria-label="Close navigation" />}
    <aside className={`sidebar ${mobileOpen ? 'sidebar--open' : ''}`}>
      <div className="sidebar-top"><BrandMark /><button className="icon-button sidebar-close" onClick={() => setMobileOpen(false)} aria-label="Close menu"><X size={19} /></button></div>
      <button className="school-switcher" onClick={onSchool} title="Switch or register a school">
        <span className="school-icon"><School size={17} /></span><span className="school-info"><strong>{school?.name || 'Northstar Academy'}</strong><small>{role === 'admin' ? 'School control room' : 'School workspace'}</small></span><ChevronDown size={15} className="muted-icon" />
      </button>
      <div className="role-switcher" aria-label="Prototype role switcher"><span className="role-label">VIEW AS</span><div>
        <button className={role === 'student' ? 'selected' : ''} onClick={() => { setRole('student'); setActive('dashboard'); }}><span className="role-dot role-dot--student" />Student</button>
        <button className={role === 'teacher' ? 'selected' : ''} onClick={() => { setRole('teacher'); setActive('dashboard'); }}><span className="role-dot role-dot--teacher" />Teacher</button>
        <button className={role === 'admin' ? 'selected' : ''} onClick={() => { setRole('admin'); setActive('dashboard'); }}><span className="role-dot role-dot--admin" />Admin</button>
      </div></div>
      <nav className="side-nav" aria-label="Main navigation">
        {entries.map((item, index) => <div key={item.id}>
          {item.section && <p className={`nav-section ${index ? 'nav-section--spaced' : ''}`}>{item.section}</p>}
          <button className={`nav-link ${active === item.id ? 'nav-link--active' : ''}`} onClick={() => { setActive(item.id); setMobileOpen(false); }}>
            <item.icon size={18} strokeWidth={1.85} /><span>{item.label}</span>{item.badge && <span className="nav-badge">{item.badge}</span>}
          </button>
        </div>)}
      </nav>
      <div className="sidebar-bottom">
        <div className="level-card"><span className="level-icon"><Sparkles size={17} /></span><div><small>{role === 'admin' ? 'LAB OPERATIONS' : 'YOUR SCIENCE STREAK'}</small><strong>{role === 'student' ? '6 days in a row' : role === 'admin' ? 'School activity healthy' : 'Class is on fire'}</strong><div className="streak-dots"><i /><i /><i /><i /><i /><i /><i className="inactive" /></div></div></div>
        <button className="profile-row" onClick={() => { const next = role === 'student' ? 'teacher' : role === 'teacher' ? 'admin' : 'student'; setRole(next); setActive('dashboard'); }}><Avatar initials={profile.initials} tone={role === 'teacher' ? 'gold' : role === 'admin' ? 'blue' : 'green'} /><span><strong>{profile.name}</strong><small>{profile.caption}</small></span><ChevronDown size={15} className="muted-icon" /></button>
        <div className="sidebar-footnote">LABQUEST <span>·</span> PROTOTYPE</div>
      </div>
    </aside>
  </>;
}

export function Header({ role, school, alerts, onNotifications, onSchool, onMenu, onCreate, onHome }) {
  const now = new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());
  return <header className="topbar">
    <button className="icon-button menu-toggle" onClick={onMenu} aria-label="Open menu"><Menu size={20} /></button>
    <div className="topbar-school"><span className="topbar-date">{now}</span><span className="topbar-divider">/</span><button onClick={onSchool}>{school?.name || 'Northstar Academy'} <ChevronDown size={14} /></button></div>
    <div className="topbar-actions">
      <button className="home-return-link" onClick={onHome}><Home size={14} /> LabQuest home</button>
      <span className="demo-pill"><i /> Demo workspace</span>
      {role === 'teacher' && <button className="button button--primary button--small topbar-create" onClick={onCreate}><Plus size={16} /> Create activity</button>}
      {role === 'admin' && <button className="button button--primary button--small topbar-create" onClick={onCreate}><Plus size={16} /> Launch activity</button>}
      <button className="notification-button" aria-label="Notifications" onClick={onNotifications}><Bell size={19} />{alerts?.some((item) => item.unread) && <i />}</button>
      <Avatar initials={role === 'teacher' ? 'EB' : role === 'admin' ? 'MO' : 'AO'} tone={role === 'teacher' ? 'gold' : role === 'admin' ? 'blue' : 'green'} />
    </div>
  </header>;
}

export function IconBadge({ name, tone = 'mint', size = 19 }) {
  const icons = { leaf: Leaf, flask: FlaskConical, atom: Atom, sprout: Sprout, microscope: Microscope, book: BookOpenCheck };
  const Icon = icons[name] || Atom;
  return <span className={`icon-badge icon-badge--${tone}`}><Icon size={size} strokeWidth={1.8} /></span>;
}

export function NotificationPanel({ alerts, onClose, onMarkRead }) {
  return <>
    <button className="panel-scrim" onClick={onClose} aria-label="Close notifications" />
    <section className="notification-panel" aria-label="Notifications">
      <div className="panel-heading"><div><span className="eyebrow">YOUR UPDATES</span><h3>Notifications</h3></div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={19} /></button></div>
      <p className="panel-subcopy">Class activity and learning milestones.</p>
      {(alerts || []).map((alert) => <article className={`notification-item ${alert.unread ? 'notification-item--unread' : ''}`} key={alert.id} onClick={() => onMarkRead(alert.id)}>
        <span className="notification-glyph"><Bell size={15} /></span><div><strong>{alert.title}</strong><p>{alert.body}</p><small>{alert.time || 'Just now'}</small></div>{alert.unread && <i />}
      </article>)}
      {!alerts?.length && <div className="empty-inline"><Sparkles size={18} /><p>You’re all caught up. New class updates will land here.</p></div>}
      <div className="panel-note">In-app prototype alerts · Email notifications are not connected</div>
    </section>
  </>;
}

export function StatCard({ label, value, note, icon: Icon, tone = 'mint', trend }) {
  return <article className="stat-card"><div className={`stat-icon stat-icon--${tone}`}><Icon size={18} /></div><div className="stat-content"><span>{label}</span><strong>{value}</strong><small>{note}</small></div>{trend && <span className="stat-trend">{trend}</span>}</article>;
}

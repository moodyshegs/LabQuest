import { useState } from 'react';
import { ArrowRight, Check, Plus, School, Trash2, X } from 'lucide-react';

export function SchoolDialog({ school, onClose, onSave }) {
  const [mode, setMode] = useState('register');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [code, setCode] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    if (mode === 'register') await onSave({ name, location });
    else await onSave({ name: school?.name || 'Northstar Science Academy', schoolCode: code.trim().toUpperCase(), joined: true });
    setSubmitted(true);
  };
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="modal-card school-modal" role="dialog" aria-modal="true" aria-labelledby="school-dialog-title">
    <button className="modal-close icon-button" onClick={onClose} aria-label="Close"><X size={19} /></button>
    {submitted ? <div className="success-screen"><span className="success-mark"><Check size={24} /></span><span className="eyebrow">SCHOOL WORKSPACE</span><h2>{mode === 'register' ? 'Your school is on the map.' : 'Request noted.'}</h2><p>{mode === 'register' ? 'This prototype has created a demo school workspace. Identity verification and member invitations are not connected yet.' : 'School-code joining is a demo flow. Connect school invitations and member authorization before real enrolment.'}</p><button className="button button--primary" onClick={onClose}>Back to learning</button></div> : <>
      <div className="modal-kicker"><span className="modal-icon"><School size={19} /></span><span className="eyebrow">SCHOOL SETUP</span></div><h2 id="school-dialog-title">A place for your<br />whole science community.</h2><p className="modal-description">Create your school space or join one with a school code.</p>
      <div className="dialog-tabs"><button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Register a school</button><button className={mode === 'join' ? 'active' : ''} onClick={() => setMode('join')}>Join a school</button></div>
      <form onSubmit={submit} className="form-stack">
        {mode === 'register' ? <><label>School name<input required minLength="3" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Northstar Science Academy" /></label><label>Town or region <span className="optional-label">OPTIONAL</span><input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Accra, Greater Accra" /></label></> : <><label>School invite code<input required value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter the code from your teacher" /></label><p className="field-help">For this prototype, joining is a demo flow; invite-code verification is not connected.</p></>}
        <button className="button button--primary button--wide" type="submit">{mode === 'register' ? 'Create demo school' : 'Continue with code'}<ArrowRight size={17} /></button>
      </form><div className="modal-footnote">Prototype workspace · no real account is created</div>
    </>}
  </section></div>;
}

export function DeveloperAccessDialog({ onClose, onGrant }) {
  const [schoolName, setSchoolName] = useState('Northstar Science Academy');
  const [schoolCode, setSchoolCode] = useState('LABQUESTDEV');
  const [accessType, setAccessType] = useState('school-admin');
  const [submitted, setSubmitted] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    const payload = {
      schoolName: schoolName.trim(),
      schoolCode: schoolCode.trim().toUpperCase(),
      accessType,
    };
    await onGrant(payload);
    setSubmitted(true);
  };

  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="modal-card developer-modal" role="dialog" aria-modal="true" aria-labelledby="developer-dialog-title">
    <button className="modal-close icon-button" onClick={onClose} aria-label="Close"><X size={19} /></button>
    {submitted ? <div className="success-screen"><span className="success-mark"><Check size={24} /></span><span className="eyebrow">ACCESS GRANTED</span><h2>School access confirmed.</h2><p>The school has been authorized with {accessType === 'school-admin' ? 'school-admin' : accessType === 'teacher' ? 'teacher' : 'student'} permissions. This is a demo-only developer flow and not a production identity system.</p><button className="button button--primary" onClick={onClose}>Continue</button></div> : <>
      <div className="modal-kicker"><span className="modal-icon modal-icon--gold"><School size={19} /></span><span className="eyebrow">DEVELOPER ACCESS</span></div>
      <h2 id="developer-dialog-title">Grant school access<br />and set the role boundary.</h2>
      <p className="modal-description">This area is restricted to the LabQuest developer workflow. Schools receive a code and a clearly defined permission level.</p>
      <form onSubmit={submit} className="form-stack developer-form">
        <label>School name<input required minLength="3" value={schoolName} onChange={(event) => setSchoolName(event.target.value)} placeholder="e.g. Northstar Science Academy" /></label>
        <label>School access code<input required minLength="6" value={schoolCode} onChange={(event) => setSchoolCode(event.target.value)} placeholder="e.g. LABQUESTDEV" /></label>
        <label>Type of access<select value={accessType} onChange={(event) => setAccessType(event.target.value)}>
          <option value="school-admin">School admin</option>
          <option value="teacher">Teacher</option>
          <option value="student">Student</option>
        </select></label>
        <div className="developer-access-summary">
          <span className="eyebrow">CONFIRMED SCOPE</span>
          <strong>{accessType === 'school-admin' ? 'School admin dashboard' : accessType === 'teacher' ? 'Teacher workspace' : 'Student workspace'}</strong>
          <small>{schoolName || 'School name'} · {schoolCode || 'ACCESS-CODE'}</small>
        </div>
        <button className="button button--primary button--wide" type="submit">Grant access<ArrowRight size={17} /></button>
      </form>
      <div className="modal-footnote">Developer-only action · not a live authentication system</div>
    </>}
  </section></div>;
}

export function CreateAssessmentDialog({ classes = [], onClose, onCreate }) {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Biology');
  const [kind, setKind] = useState('test');
  const [classroomName, setClassroomName] = useState(classes[0]?.name || 'SS2 Science A');
  const [dueAt, setDueAt] = useState('');
  const [instructions, setInstructions] = useState('');
  const [timed, setTimed] = useState(false);
  const [durationMinutes, setDurationMinutes] = useState(20);
  const [questions, setQuestions] = useState([blankQuestion()]);
  const updateQuestion = (index, changes) => setQuestions((current) => current.map((question, questionIndex) => questionIndex === index ? { ...question, ...changes } : question));
  const submit = async (event) => {
    event.preventDefault();
    const preparedQuestions = questions.map((question) => kind === 'assignment'
      ? { prompt: question.prompt.trim(), options: [], answer: null }
      : { prompt: question.prompt.trim(), options: question.options.map((option) => option.trim()), answer: question.answer });
    await onCreate({ title, subject, kind, classroomName, instructions, dueAt: dueAt || null, timed: kind !== 'assignment' && timed, durationMinutes: kind !== 'assignment' && timed ? Number(durationMinutes) : 0, questionCount: preparedQuestions.length, questions: preparedQuestions });
    onClose();
  };
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="modal-card create-modal" role="dialog" aria-modal="true" aria-labelledby="create-dialog-title">
    <button className="modal-close icon-button" onClick={onClose} aria-label="Close"><X size={19} /></button><div className="modal-kicker"><span className="modal-icon modal-icon--gold"><Check size={19} /></span><span className="eyebrow">TEACHER WORKSPACE</span></div><h2 id="create-dialog-title">Put a new challenge<br />on the class calendar.</h2><p className="modal-description">Publish an assessment for SS2 Science A.</p>
    <form className="form-stack" onSubmit={submit}>
      <label>Activity title<input required minLength="3" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Acids and bases practical" /></label>
      <div className="form-row"><label>Subject<select value={subject} onChange={(e) => setSubject(e.target.value)}>{['Biology', 'Chemistry', 'Physics', 'Agriculture', 'General Science'].map((item) => <option key={item}>{item}</option>)}</select></label><label>Activity type<select value={kind} onChange={(e) => setKind(e.target.value)}><option value="test">Test</option><option value="exam">Exam</option><option value="assignment">Assignment</option></select></label></div>
      <label>Assign to class<select value={classroomName} onChange={(event) => setClassroomName(event.target.value)}>{(classes.length ? classes : [{ name: 'SS2 Science A' }]).map((classroom) => <option value={classroom.name} key={classroom.name}>{classroom.name}</option>)}</select></label>
      <label>Instructions<textarea rows="3" value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="What should students do?" /></label>
      <div className="question-builder-heading"><span>QUESTIONS <small>{questions.length} of 12</small></span><button type="button" disabled={questions.length >= 12} onClick={() => setQuestions((current) => [...current, blankQuestion()])}><Plus size={13} /> Add question</button></div>
      {questions.map((question, index) => <section className="question-builder-card" key={index}>
        <div className="question-builder-top"><strong>QUESTION {String(index + 1).padStart(2, '0')}</strong>{questions.length > 1 && <button type="button" onClick={() => setQuestions((current) => current.filter((_, questionIndex) => questionIndex !== index))} aria-label={`Remove question ${index + 1}`}><Trash2 size={14} /></button>}</div>
        <textarea required rows="2" value={question.prompt} onChange={(event) => updateQuestion(index, { prompt: event.target.value })} placeholder={kind === 'assignment' ? 'Write the task students should respond to...' : 'Type the question...'} />
        {kind !== 'assignment' && <><div className="choice-builder-label">Answer choices <small>select the correct answer</small></div><div className="choice-builder-grid">{question.options.map((option, optionIndex) => <label key={optionIndex} className={question.answer === optionIndex ? 'choice-correct' : ''}><input type="radio" name={`correct-${index}`} checked={question.answer === optionIndex} onChange={() => updateQuestion(index, { answer: optionIndex })} aria-label={`Mark option ${optionIndex + 1} correct`} /><span>{String.fromCharCode(65 + optionIndex)}</span><input required value={option} onChange={(event) => updateQuestion(index, { options: question.options.map((item, i) => i === optionIndex ? event.target.value : item) })} placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`} /></label>)}</div></>}
      </section>)}
      <label>Due date <span className="optional-label">OPTIONAL</span><input type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} /></label>
      {kind !== 'assignment' && <><div className="timer-row"><div><strong>Set a time limit</strong><small>Students can still review instructions before starting.</small></div><button type="button" className={`toggle-switch ${timed ? 'on' : ''}`} onClick={() => setTimed(!timed)} aria-label="Toggle time limit"><i /></button></div>
      {timed && <label>Duration in minutes<input type="number" min="1" max="240" value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} /></label>}</>}
      <button className="button button--primary button--wide" type="submit">Publish to class<ArrowRight size={17} /></button>
    </form><div className="modal-footnote">Demo publication · no email is sent</div>
  </section></div>;
}

function blankQuestion() {
  return { prompt: '', options: ['', '', '', ''], answer: 0 };
}

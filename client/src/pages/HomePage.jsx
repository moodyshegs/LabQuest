import { ArrowDown, ArrowRight, ArrowUpRight, Atom, BookOpenCheck, FlaskConical, Leaf, Microscope, School, Sprout, Users } from 'lucide-react';
import { BrandMark } from '../components/Shell.jsx';

const subjects = [
  { name: 'Physics', topic: 'Circuits, forces and motion', icon: Atom, tone: 'blue' },
  { name: 'Chemistry', topic: 'Materials, mixtures and change', icon: FlaskConical, tone: 'coral' },
  { name: 'Biology', topic: 'Living systems and field observations', icon: Leaf, tone: 'mint' },
  { name: 'Agriculture', topic: 'Soil, crops and sustainable growing', icon: Sprout, tone: 'gold' },
  { name: 'Environmental Science', topic: 'Water, ecosystems and our surroundings', icon: Microscope, tone: 'mint' },
];

const steps = [
  { number: '01', title: 'Start with a question', copy: 'Give students a clear purpose and a guided path into the science behind a real-world observation.', icon: BookOpenCheck },
  { number: '02', title: 'Explore the practical', copy: 'Use interactive models and safe, step-by-step investigations to rehearse methods and notice evidence.', icon: FlaskConical },
  { number: '03', title: 'Make sense of evidence', copy: 'Record observations, explain results and let teachers follow progress with class activities.', icon: Microscope },
];

export default function HomePage({ onOpenDashboard }) {
  return <div className="landing-page" id="top">
    <header className="landing-nav">
      <a className="landing-brand" href="#top" aria-label="LabQuest home"><BrandMark /></a>
      <nav className="landing-links" aria-label="Explore LabQuest">
        <a href="#approach">Our approach</a>
        <a href="#subjects">Subjects</a>
        <a href="#schools">For schools</a>
      </nav>
      <button className="landing-dashboard-tab" onClick={() => onOpenDashboard('student')}>Dashboard <ArrowUpRight size={16} /></button>
    </header>

    <main>
      <section className="landing-hero" aria-labelledby="landing-title">
        <div className="landing-hero-copy">
          <span className="landing-eyebrow"><i /> A NEW WAY TO LEARN SCIENCE</span>
          <h1 id="landing-title">Let every Nigerian classroom become a place of <em>discovery.</em></h1>
          <p>LabQuest brings practical science within reach through guided investigations, interactive simulations and learning tools for senior secondary students—even where a dedicated laboratory is not available.</p>
          <div className="landing-actions">
            <button className="landing-primary" onClick={() => onOpenDashboard('student')}>Explore the sample dashboard <ArrowRight size={17} /></button>
            <a className="landing-secondary" href="#approach">See how it works <ArrowDown size={15} /></a>
          </div>
          <div className="landing-demo-note"><span className="landing-demo-dot" /><span><strong>Open sample experience</strong> · No sign-in yet. Use fictional details only.</span></div>
          <div className="landing-audience"><Users size={16} /><span>For students, teachers and school communities</span></div>
        </div>
        <div className="landing-hero-visual">
          <div className="landing-image-frame">
            <img src="/manus-storage/async-images/D7adgSairpvV1fThVxD3rp/image-1.webp" alt="Nigerian senior secondary students exploring plant, soil, water and circuit investigations together in a classroom" />
            <span className="landing-image-label"><FlaskConical size={13} /> SCIENCE IN ACTION</span>
            <div className="landing-image-caption"><span className="landing-caption-spark">✳</span><div><strong>Curiosity belongs in every classroom.</strong><small>Practical thinking starts with a question.</small></div></div>
          </div>
          <div className="landing-orbit landing-orbit--one" />
          <div className="landing-orbit landing-orbit--two" />
        </div>
      </section>

      <div className="landing-subject-ribbon" aria-label="Science subjects"><span>LEARN THROUGH PRACTICE</span>{subjects.map(({ name, tone }) => <span className={`landing-subject-chip landing-subject-chip--${tone}`} key={name}>{name}</span>)}</div>

      <section className="landing-section landing-approach" id="approach" aria-labelledby="approach-title">
        <div className="landing-section-intro"><span className="landing-eyebrow">WHY LABQUEST</span><h2 id="approach-title">From reading science to <em>doing science.</em></h2><p>Build practical confidence through a simple learning rhythm: ask, explore, observe and explain.</p></div>
        <div className="landing-steps">{steps.map(({ number, title, copy, icon: Icon }) => <article className="landing-step" key={number}><div className="landing-step-top"><span>{number}</span><Icon size={20} /></div><h3>{title}</h3><p>{copy}</p></article>)}</div>
      </section>

      <section className="landing-section landing-subjects" id="subjects" aria-labelledby="subjects-title">
        <div className="landing-subjects-heading"><div><span className="landing-eyebrow">A WIDER SCIENCE CLASSROOM</span><h2 id="subjects-title">One practical mindset.<br /><em>Many ways to discover.</em></h2></div><p>Explore familiar science subjects through guided activities designed to make concepts easier to investigate and discuss.</p></div>
        <div className="landing-subject-list">{subjects.map(({ name, topic, icon: Icon, tone }, index) => <article className="landing-subject-row" key={name}><span className={`landing-subject-icon landing-subject-icon--${tone}`}><Icon size={19} /></span><span className="landing-subject-index">0{index + 1}</span><h3>{name}</h3><p>{topic}</p><ArrowUpRight className="landing-subject-arrow" size={17} /></article>)}</div>
      </section>

      <section className="landing-school-panel" id="schools" aria-labelledby="school-title">
        <div className="landing-school-art"><span className="landing-school-ring landing-school-ring--outer" /><span className="landing-school-ring landing-school-ring--inner" /><span className="landing-school-emblem"><School size={29} /></span><i className="landing-school-spark landing-school-spark--one">✳</i><i className="landing-school-spark landing-school-spark--two">✦</i><span className="landing-school-art-caption">LEARN · TRY · UNDERSTAND</span></div>
        <div className="landing-school-copy"><span className="landing-eyebrow">MADE FOR SCHOOL COMMUNITIES</span><h2 id="school-title">A practical learning journey that meets schools <em>where they are.</em></h2><p>When laboratory facilities are limited, students can still rehearse a method, explore a safe virtual practical and build the habit of reasoning from evidence. LabQuest is designed to complement teacher-led learning and supervised hands-on work.</p><div className="landing-school-actions"><button className="landing-light-button" onClick={() => onOpenDashboard('teacher')}>Preview the teacher workspace <ArrowRight size={16} /></button><span><Users size={15} /> For educators and school leaders</span></div></div>
      </section>

      <section className="landing-final-cta"><span className="landing-eyebrow">SEE LABQUEST IN ACTION</span><h2>Take a look around the sample workspace.</h2><p>Switch between student and teacher views to explore the current prototype.</p><button className="landing-primary" onClick={() => onOpenDashboard('student')}>Open the dashboard <ArrowRight size={17} /></button><small>This is a public prototype, not a secure school account. Please use fictional details only.</small></section>
    </main>

    <footer className="landing-footer"><a href="#top" className="landing-footer-brand" aria-label="Back to top"><BrandMark /></a><p>Science in action, for every learner.</p><button onClick={() => onOpenDashboard('student')}>Dashboard <ArrowUpRight size={14} /></button><span>© LabQuest · Public sample demo</span></footer>
  </div>;
}

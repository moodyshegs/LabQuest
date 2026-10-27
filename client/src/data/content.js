export { practicalCatalog, subjectCatalog } from './interactivePracticals.js';

export const assessmentCatalog = [
  { id: 'cell-biology-check-in', title: 'Cell Biology Check-in', subject: 'Biology', kind: 'test', instructions: 'Review cell structures and their functions. Choose the best answer for each question.', dueAt: '2026-10-29T15:00:00', questionCount: 3, timed: true, durationMinutes: 12, questions: [{ prompt: 'Which structure controls what enters and leaves a cell?', options: ['Cell membrane', 'Cell wall', 'Ribosome', 'Vacuole'], answer: 0 }, { prompt: 'Where does photosynthesis mainly occur?', options: ['Nucleus', 'Chloroplast', 'Cytoplasm', 'Mitochondrion'], answer: 1 }, { prompt: 'Which structure contains the cell’s genetic material?', options: ['Nucleus', 'Cell membrane', 'Vacuole', 'Ribosome'], answer: 0 }], status: 'Due soon' },
  { id: 'electricity-mini-test', title: 'Electricity: mini test', subject: 'Physics', kind: 'test', instructions: 'Answer the circuit and current questions. Use your practical notes if you need a reminder.', dueAt: '2026-10-30T12:00:00', questionCount: 3, timed: false, durationMinutes: 0, questions: [{ prompt: 'What must a circuit have for current to flow?', options: ['A complete conducting path', 'Only one wire', 'An open switch', 'A plastic loop'], answer: 0 }, { prompt: 'What is the unit of electric current?', options: ['Volt', 'Ampere', 'Ohm', 'Watt'], answer: 1 }, { prompt: 'What does an open switch do?', options: ['Breaks the circuit', 'Adds a cell', 'Stores charge', 'Increases resistance to zero'], answer: 0 }], status: 'Due soon' },
  { id: 'soil-profile-report', title: 'Soil profile field notes', subject: 'Agriculture', kind: 'assignment', instructions: 'Use the virtual soil profile to describe its layers and explain how texture affects drainage.', dueAt: '2026-11-02T16:00:00', questionCount: 1, timed: false, durationMinutes: 0, questions: [{ prompt: 'Describe the soil layers and make one evidence-based prediction about drainage.', options: [], answer: null }], status: 'New assignment' },
];

export const initialAlerts = [
  { id: 'a1', title: 'A new Biology test is ready', body: 'Cell Biology Check-in · due Thursday', time: '15 min ago', unread: true },
  { id: 'a2', title: 'You earned a badge', body: 'Curious Observer · 5 practicals complete', time: 'Yesterday', unread: true },
  { id: 'a3', title: 'Practical reminder', body: 'Finish your soil profile field notes', time: 'Yesterday', unread: false },
];

export const initialSubmissions = [
  { id: 's1', student: 'Kojo Mensah', initials: 'KM', title: 'Food tests: observation table', subject: 'Biology', submitted: 'Today · 9:12 am', status: 'Needs review', response: 'Sample A turned blue-black with iodine, so starch is present.', score: '', feedback: '' },
  { id: 's2', student: 'Nana Agyeman', initials: 'NA', title: 'Simple circuits reflection', subject: 'Physics', submitted: 'Yesterday · 2:40 pm', status: 'Needs review', response: 'The lamp lit after I closed the switch. An open switch made a break in the path.', score: '', feedback: '' },
  { id: 's3', student: 'Amara Owusu', initials: 'AO', title: 'Soil profile field notes', subject: 'Agriculture', submitted: 'Yesterday · 11:05 am', status: 'Graded', response: 'The coarse sand layer should allow water to drain quickly.', score: '88', feedback: 'Good use of evidence. Add a note about clay’s water retention.' },
];

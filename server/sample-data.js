export const sampleSchool = {
  name: 'Northstar Science Academy',
  schoolCode: 'NORTHSTAR24',
  location: 'Accra, Ghana',
};

export const sampleClasses = [
  { name: 'SS2 Science A', yearLevel: 'Senior secondary · Year 2', subjectFocus: 'General Science' },
  { name: 'SS2 Science B', yearLevel: 'Senior secondary · Year 2', subjectFocus: 'General Science' },
];

export const sampleMembers = [
  { fullName: 'Amara Owusu', email: 'amara.demo@labquest.school', role: 'student' },
  { fullName: 'Kojo Mensah', email: 'kojo.demo@labquest.school', role: 'student' },
  { fullName: 'Nana Agyeman', email: 'nana.demo@labquest.school', role: 'student' },
  { fullName: 'Mrs. Esi Boateng', email: 'esi.demo@labquest.school', role: 'teacher' },
];

export const samplePracticals = [
  {
    slug: 'photosynthesis-leaf-test', subject: 'Biology', title: 'How do plants make food?',
    summary: 'Trace how light, carbon dioxide and water help a leaf make glucose.', durationMinutes: 18, points: 60,
    details: {
      intro: 'Explore how a leaf stores the food it makes. In a physical lab this activity uses heat and iodine; here you will follow a guided, safe virtual demonstration and interpret the observations.',
      apparatus: ['A healthy green leaf', 'Hot water bath (demonstration only)', 'Iodine solution (demonstration only)', 'White tile and forceps'],
      safety: ['Do not heat water or handle iodine outside a supervised, equipped laboratory.', 'For this virtual practical, inspect the illustrated demonstration and use the observation notes provided.'],
      steps: ['Review the materials and safety notes.', 'Follow the virtual demonstration of a leaf being decolourised in a hot-water bath.', 'Observe the iodine being added to the leaf.', 'Record the colour change and explain what it indicates.'],
      observations: 'The part of the leaf exposed to light turns blue-black when iodine is added.',
      conclusion: 'A blue-black colour indicates starch. The result supports the idea that the leaf made and stored food when light was available.',
      question: 'What does the blue-black colour show is present in the leaf?',
    },
  },
  {
    slug: 'food-tests', subject: 'Biology', title: 'What is in your food?',
    summary: 'Use indicator results to identify starch, reducing sugars, protein and fats.', durationMinutes: 16, points: 50,
    details: {
      intro: 'Interpret a set of food-test results and match each indicator response to a nutrient.',
      apparatus: ['Food sample cards', 'Iodine result card', 'Benedict’s result card', 'Biuret result card', 'Ethanol emulsion result card'],
      safety: ['This activity is a virtual results investigation; do not heat samples or handle reagents at home.', 'In a real lab, follow your teacher’s instructions and eye-protection guidance.'],
      steps: ['Read the sample descriptions.', 'Compare each sample with the indicator-result chart.', 'Record which nutrient each result indicates.', 'Use the evidence to classify the unknown sample.'],
      observations: 'Sample A turns iodine blue-black; Sample B gives an orange precipitate with Benedict’s solution after heating; Sample C turns lilac with Biuret reagent.',
      conclusion: 'The indicator tests reveal different food molecules: iodine indicates starch, Benedict’s indicates reducing sugar, and Biuret reagent indicates protein.',
      question: 'Which reagent is used to test for starch?',
    },
  },
  {
    slug: 'acid-base-indicators', subject: 'Chemistry', title: 'Which liquid is acidic?',
    summary: 'Compare indicator colours and arrange everyday liquids by approximate pH.', durationMinutes: 14, points: 45,
    details: {
      intro: 'Use a universal-indicator colour chart to compare safe, pre-recorded results from familiar liquids.',
      apparatus: ['Universal indicator colour chart', 'Dilute sample result cards', 'pH scale'],
      safety: ['Use the virtual result cards only—never taste or mix unknown household chemicals.', 'Do not mix bleach, cleaners or other household products.'],
      steps: ['Review the pH colour scale.', 'Inspect each sample’s recorded indicator colour.', 'Match each colour to an approximate pH.', 'Sort the sample cards from most acidic to most alkaline.'],
      observations: 'The lemon sample is orange-red, the water sample is green, and the dilute soap sample is blue.',
      conclusion: 'A pH below 7 is acidic, 7 is neutral and above 7 is alkaline. The colour changes provide evidence for comparison.',
      question: 'What pH value is neutral on the standard pH scale?',
    },
  },
  {
    slug: 'simple-electric-circuits', subject: 'Physics', title: 'Build a working circuit',
    summary: 'Explore how a closed path, cell and switch control a lamp.', durationMinutes: 20, points: 65,
    details: {
      intro: 'Connect a virtual cell, wire, switch and lamp, then predict what changes when the circuit is opened.',
      apparatus: ['Cell symbol', 'Connecting wires', 'Switch', 'Lamp'],
      safety: ['Use only the low-voltage virtual circuit in this activity.', 'Never experiment with wall sockets or mains electricity.'],
      steps: ['Place a cell and lamp in the workspace.', 'Connect each component into one continuous loop.', 'Close the switch and record the lamp state.', 'Open the switch and compare the result.'],
      observations: 'The lamp lights when the switch is closed and the circuit forms a complete loop. It goes out when the loop is broken.',
      conclusion: 'A current flows only when there is a complete conducting path from one cell terminal, through the components, and back to the other terminal.',
      question: 'Why does a lamp go out when the switch opens the circuit?',
    },
  },
  {
    slug: 'soil-texture', subject: 'Agriculture', title: 'Get to know your soil',
    summary: 'Use a settling-jar observation to compare sand, silt and clay layers.', durationMinutes: 17, points: 55,
    details: {
      intro: 'Examine a virtual soil-settling observation and infer how texture affects water movement.',
      apparatus: ['Sample soil profile illustration', 'Water-settling jar diagram', 'Layer guide'],
      safety: ['The demonstration is virtual. If collecting soil later, wash hands and avoid dusty or contaminated sites.', 'Do not drink laboratory or field samples.'],
      steps: ['Inspect the settled profile illustration.', 'Identify the coarse, middle and fine layers.', 'Compare the relative layer widths.', 'Predict how quickly water may pass through the sample.'],
      observations: 'A thick coarse bottom layer indicates more sand; a fine upper layer indicates smaller clay particles.',
      conclusion: 'Soil texture depends on the proportions of sand, silt and clay, which influence drainage and water retention.',
      question: 'Which soil particle type is largest: sand, silt or clay?',
    },
  },
  {
    slug: 'plant-propagation', subject: 'Agriculture', title: 'Grow a new plant from a cutting',
    summary: 'Compare vegetative propagation with growing from seed.', durationMinutes: 12, points: 40,
    details: {
      intro: 'Plan the conditions a stem cutting needs to develop roots and compare the method with seed propagation.',
      apparatus: ['Stem-cutting diagram', 'Root-development timeline', 'Moisture and shade guide'],
      safety: ['This is a planning activity. If you try a real cutting, use clean tools with adult or teacher supervision.', 'Never handle unfamiliar plants without checking that they are safe.'],
      steps: ['Inspect the labelled cutting diagram.', 'Identify the node that can form roots.', 'Choose suitable moisture and light conditions.', 'Order the stages from cutting to rooted plant.'],
      observations: 'A node below the moist growing medium is the location where new roots can form.',
      conclusion: 'Vegetative propagation can produce a plant genetically similar to its parent without using a seed.',
      question: 'Which part of a stem cutting commonly produces new roots?',
    },
  },
  {
    slug: 'water-treatment', subject: 'Environmental Science', title: 'How is water cleaned?',
    summary: 'Follow a virtual treatment train and identify how filtration improves water quality.', durationMinutes: 15, points: 50,
    details: {
      intro: 'Trace the stages used to clarify water and compare what filtration can remove with what it cannot remove.',
      apparatus: ['Treatment process diagram', 'Settling and filtration cards', 'Water-quality observation chart'],
      safety: ['This is a virtual activity. Do not drink untreated or laboratory water samples.', 'Real water treatment involves trained operators and approved treatment methods.'],
      steps: ['Inspect the untreated-water observation card.', 'Arrange screening, settling and filtration in order.', 'Compare the before-and-after observation notes.', 'Decide what additional treatment may be needed before water is safe to drink.'],
      observations: 'After settling and filtration the water looks clearer, but appearance alone cannot confirm that it is safe to drink.',
      conclusion: 'Filtration can remove some suspended particles, but clear-looking water may still contain harmful microorganisms or dissolved substances.',
      question: 'Why is clear-looking water not always safe to drink?',
    },
  },
];

export const sampleAssessments = [
  {
    slug: 'cell-biology-check-in', title: 'Cell Biology Check-in', subject: 'Biology', kind: 'test',
    instructions: 'Review cell structures and their functions. Choose the best answer for each question.',
    dueAt: '2026-10-29T15:00:00', questionCount: 3, timed: true, durationMinutes: 12,
    questions: [
      { prompt: 'Which structure controls what enters and leaves a cell?', options: ['Cell membrane', 'Cell wall', 'Ribosome', 'Vacuole'], answer: 0 },
      { prompt: 'Where does photosynthesis mainly occur?', options: ['Nucleus', 'Chloroplast', 'Cytoplasm', 'Mitochondrion'], answer: 1 },
      { prompt: 'Which structure contains the cell’s genetic material?', options: ['Nucleus', 'Cell membrane', 'Vacuole', 'Ribosome'], answer: 0 },
    ], status: 'Due soon',
  },
  {
    slug: 'electricity-mini-test', title: 'Electricity: mini test', subject: 'Physics', kind: 'test',
    instructions: 'Answer the circuit and current questions. Use your practical notes if you need a reminder.',
    dueAt: '2026-10-30T12:00:00', questionCount: 3, timed: false, durationMinutes: 0,
    questions: [
      { prompt: 'What must a circuit have for current to flow?', options: ['A complete conducting path', 'Only one wire', 'An open switch', 'A plastic loop'], answer: 0 },
      { prompt: 'What is the unit of electric current?', options: ['Volt', 'Ampere', 'Ohm', 'Watt'], answer: 1 },
      { prompt: 'What does an open switch do?', options: ['Breaks the circuit', 'Adds a cell', 'Stores charge', 'Increases resistance to zero'], answer: 0 },
    ], status: 'Due soon',
  },
  {
    slug: 'soil-profile-report', title: 'Soil profile field notes', subject: 'Agriculture', kind: 'assignment',
    instructions: 'Use the virtual soil profile to describe its layers and explain how texture affects drainage.',
    dueAt: '2026-11-02T16:00:00', questionCount: 1, timed: false, durationMinutes: 0,
    questions: [{ prompt: 'Describe the soil layers and make one evidence-based prediction about drainage.', options: [], answer: null }], status: 'New assignment',
  },
];

export const sampleAlerts = [
  { id: 'a1', title: 'A new Biology test is ready', body: 'Cell Biology Check-in · due Thursday', time: '15 min ago', unread: true },
  { id: 'a2', title: 'You earned a badge', body: 'Curious Observer · 5 practicals complete', time: 'Yesterday', unread: true },
  { id: 'a3', title: 'Practical reminder', body: 'Finish your soil profile field notes', time: 'Yesterday', unread: false },
];

export const sampleSubmissionQueue = [
  { id: 's1', student: 'Kojo Mensah', initials: 'KM', title: 'Food tests: observation table', subject: 'Biology', submitted: 'Today · 9:12 am', status: 'Needs review', response: 'Sample A turned blue-black with iodine, so starch is present.', score: '', feedback: '' },
  { id: 's2', student: 'Nana Agyeman', initials: 'NA', title: 'Simple circuits reflection', subject: 'Physics', submitted: 'Yesterday · 2:40 pm', status: 'Needs review', response: 'The lamp lit after I closed the switch. An open switch made a break in the path.', score: '', feedback: '' },
  { id: 's3', student: 'Amara Owusu', initials: 'AO', title: 'Soil profile field notes', subject: 'Agriculture', submitted: 'Yesterday · 11:05 am', status: 'Graded', response: 'The coarse sand layer should allow water to drain quickly.', score: '88', feedback: 'Good use of evidence. Add a note about clay’s water retention.', },
];

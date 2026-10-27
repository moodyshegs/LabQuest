# LabQuest Prototype — TODO

## 1. Public landing page and dashboard entry
- [x] Make the first website screen a public landing page that talks about how we can revolutionize learning in Nigerian schools.
- [x] Provide a visible tab where visitors can access the dashboard, while keeping the landing page as the first access point; describe the existing dashboard as a sample prototype, not secure account sign-in.

## 2. School onboarding and learning community
- [x] Provide a school registration/setup experience and onboarding into the correct school community for teachers and students, with their roles reflected in the experience. Prototype registration creates a school, an SS2 class, and sample teacher/student profiles; role switching displays separate teacher and student workspaces.
- [ ] Verify real school-code enrollment and connect individual teacher/student accounts to authorized school memberships; the prototype join-code flow is deliberately unverified.
- [x] Keep the prototype easy to modify so onboarding can later be connected to production identity and school-management flows.

## 3. Role-based dashboards and science navigation
- [x] Provide distinct student and teacher dashboards tailored to each role’s tasks, activity, and progress.
- [x] Support navigation across physics, chemistry, biology, agriculture, and additional practical science subjects and topics, including Environmental Science.
- [x] Make the dashboards responsive and usable on phone, tablet, and desktop-sized screens.

## 4. Editable practical learning content
- [x] Provide interactive virtual practical activities that guide students through apparatus, procedures, observations, safety steps, and conclusions without requiring a physical laboratory; the Physics circuit practical includes an interactive switch-and-lamp simulation.
- [x] Provide a reusable lesson/practical content structure that can be modified or extended with subjects, topics, instructions, media, and questions.
- [x] Make practical activity completion and learning progress visible to students and teachers, with prototype completion and points persisted in the managed database.

## 5. Assessments and teacher review
- [x] Let teachers create and publish exams, tests, and assignments to a selected class, including editable questions and multiple-choice answer keys or written-response tasks.
- [x] Let students view assessment instructions, answer timed or untimed questions, submit work, and see saved scores and teacher feedback when available.
- [x] Provide teacher views to monitor submissions, mark work, and give feedback.

## 6. Gamification and progress
- [x] Include points, badges, practical-completion milestones, progress levels, and subject achievements in the student experience.
- [x] Surface achievement and subject progress in a way that encourages practical learning.

## 7. Managed learning data and practical resources
- [x] Use the approved managed data foundation for schools, users, class relationships, science content, assessment records, grades, achievements, and progress.
- [ ] Use the approved practical resource library capability to securely store experiment illustrations, instructional videos, worksheets, student evidence, and assignment attachments.
- [x] Include in-app class-activity alerts for published assessments, submissions, grading, and key practical-completion achievements.
- [ ] Deliver class alerts for approaching deadlines; automated deadline notifications are not yet implemented.

## 8. React-first modifiable prototype
- [x] Build a component-based React.js frontend that is straightforward to modify and designed for future adaptation into an app.
- [x] Keep frontend view components, editable sample content, and data-access boundaries organized so a later production backend can be integrated without rewriting the interface.

# LabQuest Public Landing Page — Implementation Plan

## Product and implementation

Turn the current root screen into a public, responsive LabQuest introduction about improving practical science learning in Nigerian schools. Keep the existing React dashboard as a separate, one-click destination exposed as a clearly named **Dashboard** tab/button in the homepage navigation. The homepage will explain the practical-learning approach, subjects and value for students, teachers and schools, then invite visitors to explore the existing sample dashboard. It must not imply that this demo is a secure sign-in experience or make unsupported impact claims. Preserve the visible prototype warning and tell visitors not to enter real student data.

Use the existing React 18 + Vite frontend, Express same-origin serving, CSS, icon library and current brand assets. Add a focused `HomePage.jsx` component for the public landing content. `App.jsx` will start on a `landing` view and switch to the current dashboard experience on the Dashboard action; the dashboard header will provide a return-to-home link. Keep the current client-side single-page route `/`, so `public/manus-routes.json` remains the source-declared route. Generate one original hero photograph-style illustration for this page and store it in project public assets. No new backend or third-party dependencies are needed.

### Project structure

- `client/src/pages/HomePage.jsx` — marketing/home sections, page navigation callbacks and responsive content.
- `client/src/App.jsx` — initial landing view, switch into the current sample dashboard, and pass a return-home callback.
- `client/src/components/Shell.jsx` — dashboard header home-return affordance.
- `client/src/styles.css` — homepage layout, responsive behavior, focus/hover and reduced-motion handling, while retaining existing dashboard styles.
- `public/labquest-home-hero.png` — custom landing hero image.
- `index.html` — descriptive title and metadata plus a meaningful, public HTML fallback for crawlers and visitors without JavaScript.
- `public/manus-routes.json` — one root route titled for the Nigerian science-learning homepage; the dashboard remains a client view of `/`.

## Design

Reuse the existing LabQuest science-notebook and learning-dashboard identity rather than introducing a competing style.

- **Design Movement:** Contemporary editorial education design, paired with the established LabQuest nature-toned product UI.
- **Core Principles:** Practical learning first; confidence without inflated promises; welcoming to learners and educators; clear progression from story to dashboard.
- **Color Philosophy:** Retain LabQuest's deep botanical green for trust, warm paper neutrals for approachability, and small golden accents for discovery and energy.
- **Layout Paradigm:** A broad editorial landing canvas with asymmetric hero split, generous whitespace, and sequential story sections; avoid repetitive centered card grids.
- **Signature Elements:** The existing flask wordmark; fine science-notebook orbit/line motifs; compact subject-color markers carried over from the dashboards.
- **Interaction Philosophy:** The Dashboard tab is immediately visible and reachable by keyboard and touch; section links scroll to useful context; calls to action state clearly whether they introduce the platform or open the sample dashboard.
- **Animation:** Restrained entrance/hover transitions only; honor `prefers-reduced-motion`; no animated background that competes with reading.
- **Typography System:** Keep DM Sans for body/UI copy and Manrope for display headings to preserve project continuity; use strong line-height, short paragraphs and fluid headings.
- **Brand Essence:** A practical science-learning platform for Nigerian secondary schools, making guided investigation easier to access; curious, grounded, encouraging.
- **Brand Voice:** Direct and hopeful, focused on what learners can do. Examples: “Science should be something you do, not only something you read.” “Explore the LabQuest sample dashboard.”
- **Wordmark & Logo:** Keep the current custom flask mark and LabQuest lockup; do not substitute a default-font wordmark.
- **Signature Brand Color:** LabQuest deep green (`#1a6558`), paired with the dark green shell already in the app.

## Serving and constraints

The existing Vite development middleware and Express production server serve the React app from the same origin. Keep the route manifest synchronized with the single root app route. Do not add authentication or suggest the prototype dashboard is a protected student account area; secure authentication and school-level role authorization remain future work. The existing public-demo warning remains visible in the dashboard. The homepage should also label dashboard access as a sample experience so visitors do not mistake the role switcher for real login.

Search and link previews should identify only the public home page; include its meaningful content in the initial HTML along with accurate page and social-card metadata using the existing known publication origin.

## Interactive practical expansion — complete

The practical library now contains 30 interactive activities: five each for Physics, Chemistry, Biology, Agriculture, Environmental Science and Electronics. Each activity uses the shared `InteractiveLab` workspace with left-side input controls, a centre visual model, live measurements, an observation readout and an SVG graph that redraws from the current inputs. The catalogue and model definitions live in `client/src/data/interactivePracticals.js`; the workspace and responsive styling live in `client/src/components/InteractiveLab.jsx` and `client/src/interactive.css`.

Validation completed: `pnpm install --frozen-lockfile && pnpm build`, catalogue count/subject distribution checks, HTTP smoke test against the Express/Vite server, and server-side rendering of all 30 interactive practicals through the project’s automatic JSX transform.

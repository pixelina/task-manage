# Board App (Task Manage)

## Project description

Vue 3 single-page application for managing projects and tasks. Built with **Vue 3** (Composition API), **Vite**, **Vue Router**, **Pinia**, **TypeScript**, and **BEM + SCSS**. Features include:

- Projects and Tasks lists with sorting, search, drag-and-drop and filters
- Task boards with drag-and-drop (vuedraggable)
- Charts and basic analytics
- Add/Edit/Delete projects and tasks
- Responsive UI

### Styling and design system

- **Style normalization**: [modern-normalize](https://github.com/sindresorhus/modern-normalize) is applied globally for consistent baseline styles across browsers.
- **SCSS variables** (`src/assets/scss/_variables.scss`): colors, spacing, typography, border radius, breakpoints, and a unified control height for inputs/buttons. These are also exposed as **CSS custom properties** in `:root` (in `main.scss`) so components can use either `var(--color-primary)` or the SCSS variables.
- **Base styles** (`src/assets/base/_default-settings.scss`): after normalization, box-sizing reset, base font and colors on `html`/`body`, and minimal defaults for links, buttons, and form controls.
- **BEM + SCSS**: component styles follow BEM-like naming and are written in SCSS (no utility-first framework).

### Other notable details

- **State**: Pinia stores for projects and tasks.
- **API**: Axios-based API layer with simple request/response normalization.
- **UI feedback**: Toast notifications via a shared composable (`useToast`).
- **Charts**: Chart.js is used for task distribution and other analytics.

## Live version

<!-- Link will be added when the app is deployed -->
**Deployed app:** _[To be added — deployment pending]_

## Deployment (Vercel)

The app is deployed on **Vercel** as a static site. The repository root is the project root.

1. **Build**: Vercel runs `npm run build` at the repo root. Output directory: `dist/`.
2. **Framework preset**: Vite (or Static Site). Leave **Root Directory** empty — the repo root is the app root.
3. **Environment**: No server-side env required for a static frontend unless you add API base URLs later.

Optional: add `vercel.json` in the repo root for SPA routing:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

## Local development

### Prerequisites

- **Node.js** 18+ (recommended: LTS)
- **npm**, **yarn**, or **pnpm**

### Steps

1. **Clone the repository**:

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Start the dev server**:

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173` (or the port shown in the terminal).

4. **Other commands**:
   - **Build for production:** `npm run build`
   - **Preview production build:** `npm run preview`

### Project structure

- `src/` — sources (components, views, store, composables, types)
- `public/` — static assets
- `index.html` — entry HTML
- `vite.config.ts` — Vite configuration

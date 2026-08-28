# AGENTS.md: Promotions Management Platform

## Project Overview

A robust, production-grade web application for registering and managing product promotions and discounts for retail POS systems (Kódigo Fuente). The system guarantees promotion validity control, state machine integrity, and real-time business metrics.

---

## CRITICAL RULES AND CONVENTIONS

### 1. STRICT NO-EMOJIS CLAUSE (MANDATORY)
* **It is strictly forbidden to use emojis anywhere in the codebase.**
* No emojis in log messages, console outputs, source code, comments, commit messages, PR descriptions, test outputs, error responses, or UI components.
* Always use structured, professional, clean log formatting with standard level tags: `[INFO]`, `[WARN]`, `[ERROR]`, `[FATAL]`, `[SUCCESS]`, `[DEBUG]`.

### 2. Architecture & Design Principles
* **Layered Clean Architecture**:
  * `routes/`: HTTP route definitions and middleware bindings.
  * `controllers/`: HTTP request parsing, status code handling, and response formatting.
  * `services/`: Pure business logic, state machine transitions, domain validations.
  * `repositories/`: Data access layer interfacing directly with Prisma ORM.
  * `schemas/`: Zod schemas for input/output validation and TypeScript type inference.
  * `config/`: Centralized, fail-fast environment variables.
* **Separation of Concerns**: Controllers MUST NOT contain SQL/Prisma queries or business logic. Services MUST NOT interact directly with Express `req` or `res`.
* **Dependency Injection & Inversion**: Services and controllers receive dependencies (e.g., Prisma repositories) to ensure deterministic unit testing.

### 3. Design Philosophy & Visual Direction (Apple-Inspired Standard)
* Design should feel elegant, calm, polished, and **human/consumer-friendly** with a strong Apple-inspired influence.
* **CRITICAL:** Avoid "corporate" or rigid internal-dashboard aesthetics (e.g., cramped headers, excessive flat greys, generic AI slop). The UI must feel vibrant, premium, and alive.
* Prioritize simplicity, strong typography hierarchy (Plus Jakarta Sans / display pairing, size & weight hierarchy over excessive colors), balanced whitespace (let components breathe), and restrained but intentional color usage relying strictly on CSS variables in `globals.css`.
* Use subtle animations and transitions with `framer-motion` (spring physics or custom easing curves like `ease: [0.32, 0.72, 0, 1]`) to reinforce clarity, not mere decoration.
* Keep components consistent, focused, and reusable.

### 4. Design Tokens Strict Compliance (CRITICAL)
* **DO NOT invent or hardcode Tailwind utility values** for shadows, borders, radii, surfaces, or colors.
* **ALWAYS** use the exact CSS variables defined in `frontend/src/styles/globals.css`:
  * **Surfaces**: `bg-[var(--surface-0)]`, `bg-[var(--surface-1)]`, `bg-[var(--surface-2)]`, `bg-[var(--surface-3)]`, `bg-[var(--surface-glass)]`.
  * **Shadows**: `shadow-[var(--shadow-sm)]`, `shadow-[var(--shadow-md)]`, `shadow-[var(--shadow-lg)]`, `shadow-[var(--glass-shadow)]` (Never use generic `shadow-sm`, `shadow-md`, etc.).
  * **Radii**: `rounded-[var(--radius-xs)]`, `rounded-[var(--radius-sm)]`, `rounded-[var(--radius-md)]`, `rounded-[var(--radius-lg)]`, `rounded-[var(--radius-xl)]`, `rounded-[var(--radius-2xl)]`.
  * **Borders**: `border-[var(--border-strong)]`, `border-[var(--border-soft)]`, `border-[var(--glass-border)]`.
  * **Text**: `text-[var(--text-primary)]`, `text-[var(--text-secondary)]`, `text-[var(--text-muted)]`.
  * **Accents & Status**: `bg-[var(--app-primary)]`, `text-[var(--color-programmed)]`, `text-[var(--color-active)]`, `text-[var(--color-finished)]`, `text-[var(--color-pending)]`, `text-[var(--color-info)]`, `text-[var(--color-error)]`, `text-[var(--color-success)]`.
* **Nested Border Radius Consistency (Hierarchy & Scaling Rule)**:
  * Maintain geometric visual harmony between outer surfaces (parent containers/drawers/modals) and inner elements (cards, badges, buttons, inputs).
  * Outer containers / page shells / modals use larger radii (`rounded-[var(--radius-2xl)]` or `rounded-[var(--radius-xl)]`).
  * Nested child elements (cards inside a surface, badges, inputs, or compact cards in multi-column grids) MUST scale down to proportionally smaller radii (`rounded-[var(--radius-lg)]`, `rounded-[var(--radius-md)]`, or `rounded-[var(--radius-sm)]`).
  * Never force large radii (`rounded-[var(--radius-2xl)]`) on small inner elements.

### 5. Icon & Badge Design Standard (CRITICAL)
* **NEVER use translucent or low-contrast icon badges** (such as `bg-indigo-500/10 text-indigo-500` or `bg-red-500/10 text-red-500`).
* **ALWAYS style icon badges with solid or subtle gradient backgrounds and pure white icons**:
  * **Badge container**: Solid token or rich gradient (e.g. `bg-[var(--app-primary)]`, `bg-[var(--color-info)]`, `bg-[var(--color-error)]`, `bg-[var(--color-success)]`, `bg-[var(--text-primary)]`, or `bg-[linear-gradient(135deg,var(--app-primary),var(--app-primary-strong))]`).
  * **Badge shape**: Rounded (`rounded-full` or `rounded-[var(--radius-md)]`) with subtle elevation (`shadow-[var(--shadow-sm)]`).
  * **Icon color**: **ALWAYS pure white (`text-white`)** (e.g., `<AppIcon icon={Tag} className="h-4 w-4 text-white" />` or `<Percent className="h-4 w-4 text-white" />`).

### 6. Modals, Drawers & Forms Standard
* **Layout & Container**:
  * Modal/drawer container must use a base surface like `bg-[var(--surface-2)]`.
  * Use large border radii for container edges (e.g. `rounded-l-[var(--radius-2xl)]` for right-side slide drawers, `rounded-[var(--radius-2xl)]` for center modals).
  * Use an overlay backdrop behind modal (`bg-black/30 backdrop-blur-sm dark:bg-black/60`).
* **Internal Grouping (Cards)**:
  * Do NOT use `<hr>` to separate form sections.
  * Group related fields into independent cards using `bg-[var(--surface-3)]`, `rounded-[var(--radius-lg)]`, `border border-[var(--border-strong)]`, and `shadow-[var(--shadow-sm)]`.
  * Inside cards, inputs/fields should use slightly offset backgrounds for contrast (e.g. `bg-[var(--surface-2)]` or `bg-[var(--surface-1)]`).
* **Animations**:
  * Always use `framer-motion` (`<AnimatePresence>` and `<motion.div>`) for mounting/unmounting modals and drawers.
  * Use custom easing curves for premium slide-in/slide-out effects (e.g., `ease: [0.32, 0.72, 0, 1]`) instead of default linear animations.

### 7. Custom Selects & Dropdowns (No Native Selects)
* **CRITICAL:** Do NOT use native HTML `<select>` elements anywhere in the application. They render generic browser lists that clash with premium design standards.
* **Implementation:** Always use styled HeroUI Select or custom animated dropdown components composed with `framer-motion` and design tokens.

### 8. Zero Mock Metrics & Strict Data Integrity
* **No Hardcoded/Fake Metrics (CRITICAL)**: It is strictly forbidden to hardcode, simulate, mock, or hallucinate metrics, transaction details, financial figures, or fake activities anywhere in production dashboards or client-facing views.
* All data must map 1:1 to real database tables or actual backend calculations.
* Empty/null values must fallback gracefully to clean empty states rather than fake placeholders.

### 9. Strict File Naming (CRITICAL)
* It is strictly forbidden to name files using vague or generic terms (such as `Helper.ts`, `Utils2.tsx`, `Item.tsx`, `Section1.tsx`).
* Files must ALWAYS be named precisely according to their exact logic, underlying data model, component behavior, and functional role within the application (e.g. `PromotionFilterBar.tsx`, `PromotionSummaryCard.tsx`, `PromotionEditorDrawer.tsx`, `PromotionMetricGrid.tsx`).

### 10. Testing & Automation Constraints
* **CRITICAL:** DO NOT use the browser subagent (`browser_subagent`) to test or verify UI changes. It is slow and prone to environment issues. Always rely on static analysis, `pnpm build` / `tsc` checks, unit tests, and local dev server verification.

---

## Directory Structure

```text
prueba-tecnica/
├── .agents/skills/          <- Local agent skills
├── .github/workflows/       <- CI/CD GitHub Actions pipelines
├── backend/
│   ├── prisma/              <- Schema definitions, migrations, and seed scripts
│   ├── src/
│   │   ├── config/          <- Environment configuration and Zod fail-fast schema
│   │   ├── controllers/     <- Express controllers
│   │   ├── middlewares/     <- Error handler, logger, and request validators
│   │   ├── repositories/    <- Database access abstraction
│   │   ├── routes/          <- REST API route definitions
│   │   ├── schemas/         <- Zod validation schemas
│   │   ├── services/        <- Business logic and state machine
│   │   ├── types/           <- Custom TypeScript types and interfaces
│   │   ├── app.ts           <- Express application setup
│   │   └── server.ts        <- Server bootstrap and graceful shutdown
│   └── tests/               <- Vitest unit and integration test suite
├── frontend/
│   ├── src/
│   │   ├── components/      <- UI components (layout, promotions, ui, modals)
│   │   ├── hooks/           <- React custom hooks
│   │   ├── services/        <- Typed HTTP API client
│   │   ├── styles/          <- Design tokens (globals.css) and Tailwind config
│   │   └── types/           <- Shared frontend TypeScript types
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml       <- Container orchestration
├── DECISIONS.md             <- Architectural Decision Records (ADRs)
└── README.md                <- Setup, execution, and verification guide
```

---

## Development Workflow Commands

### Backend
* Install dependencies: `pnpm install`
* Start development server: `pnpm dev`
* Run typecheck: `pnpm tsc --noEmit`
* Run unit tests: `pnpm test`
* Run migrations: `pnpm prisma:migrate`
* Seed database: `pnpm prisma:seed`
* Build production bundle: `pnpm build`

### Frontend
* Install dependencies: `pnpm install`
* Start development server: `pnpm dev`
* Build production bundle: `pnpm build`
* Run linter: `pnpm lint`

---

## PR Instructions

- Prefer concise commits with prefixes like `feat:`, `fix:`, `docs:`, and `chore:` when applicable.
- Update `CHANGELOG.md` on release-worthy changes.
- **Git Tagging & Release Protocol**:
  1. Validate codebase builds (`pnpm build` in frontend and `pnpm test` in backend).
  2. Bump the version in `frontend/package.json`.
  3. Update `CHANGELOG.md` under the corresponding version.
  4. Stage, commit (`git commit -m "<msg>"`), and push changes to `main`.
  5. Create a local annotated Git tag: `git tag -a vMAJOR.MINOR.PATCH -m "Release vMAJOR.MINOR.PATCH"`.
  6. Push the tag to the remote origin: `git push origin vMAJOR.MINOR.PATCH`.

## Command Shortcut: "ya sabes que hacer"

When the user sends the command **"ya sabes que hacer"**, it automatically triggers the complete pre-release and Git deployment workflow. The agent MUST execute the following sequence autonomously without asking or hesitating:

1. **Verify Codebase Quality & Errors**:
   - Run `pnpm build` from `frontend/`.
   - Run backend typecheck and unit tests (`pnpm tsc --noEmit` and `pnpm test` from `backend/`).
2. **Inspect New/Untracked Files**:
   - Run `git status` to identify all new, modified, or untracked files.
   - Inspect new files for potential errors, missing imports, or bad practices, and fix them cleanly without breaking new functionality.
3. **Bump Version & Update Documentation**:
   - Increment the patch/minor version in `frontend/package.json` (e.g. `1.0.1` -> `1.0.2`).
   - Append the release entry under the new version in `CHANGELOG.md` adhering strictly to Keep a Changelog format.
4. **Git Commit & Tag Release Protocol**:
   - Stage all relevant changes (`git add .`).
   - Commit with a descriptive release message (`git commit -m "chore: release vMAJOR.MINOR.PATCH - <summary>"`).
   - Create local annotated Git tag: `git tag -a vMAJOR.MINOR.PATCH -m "Release vMAJOR.MINOR.PATCH"`.
   - Push changes and tag to origin: `git push origin main` and `git push origin vMAJOR.MINOR.PATCH`.
5. **Follow Best Practices**:
   - Ensure clean console/lint states, correct file naming conventions, and proper design token usage before finalizing the push.

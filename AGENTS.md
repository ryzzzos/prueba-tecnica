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

### 3. Frontend Component Priority Rule (HeroUI First)
* **Always use and prioritize HeroUI components (`@heroui/react`)** for all interface elements (Tables, Modals, Drawers, Inputs, Selects, Buttons, Badges/Chips, Cards, Tooltips).
* **Fallback Rule**: Only if HeroUI does not have a component that fulfills a specific design or interaction requirement, proceed to design a custom component using Tailwind CSS and Framer Motion, adhering strictly to the design tokens in `globals.css`.
* **Design Tokens Compliance**: Always respect and integrate the CSS variables (`--surface-0`, `--surface-1`, `--border-strong`, `--text-primary`, etc.) when customizing HeroUI components.
* **Zero Mock Metrics**: All dashboard KPIs must map 1:1 to real backend calculations.

### 4. Error Handling & Validation
* Always throw domain errors (`AppError`, `NotFoundError`, `ConflictError`, `ValidationError`) in the service layer.
* Global error middleware (`errorHandler.ts`) catches and normalizes errors into standardized JSON responses:
  * `400 Bad Request`: Domain rule violations (e.g., trying to delete an active promotion).
  * `404 Not Found`: Resource does not exist.
  * `422 Unprocessable Entity`: Schema/Zod validation failures with specific field breakdown.
  * `500 Internal Server Error`: Unexpected runtime errors with sensitive details hidden.

### 5. Database & ORM Guidelines
* Use PostgreSQL with Prisma ORM.
* Financial and discount values MUST use `Decimal(10, 2)` (avoid IEEE 754 floating-point inaccuracies).
* Use UUIDs for entity primary keys.
* Schema changes must be applied via Prisma migrations (`prisma migrate dev` / `prisma migrate deploy`).

---

## Directory Structure

```text
prueba-tecnica/
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
│   │   ├── components/      <- UI components (HeroUI + custom fallbacks)
│   │   ├── hooks/           <- React custom hooks
│   │   ├── services/        <- Typed HTTP API client
│   │   ├── styles/          <- Design tokens and Tailwind CSS configuration
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
   - Increment the patch/minor version in `frontend/package.json` (e.g. `1.0.0` -> `1.0.1`).
   - Append the release entry under the new version in `CHANGELOG.md` adhering strictly to Keep a Changelog format.
4. **Git Commit & Tag Release Protocol**:
   - Stage all relevant changes (`git add .`).
   - Commit with a descriptive release message (`git commit -m "chore: release vMAJOR.MINOR.PATCH - <summary>"`).
   - Create local annotated Git tag: `git tag -a vMAJOR.MINOR.PATCH -m "Release vMAJOR.MINOR.PATCH"`.
   - Push changes and tag to origin: `git push origin main` and `git push origin vMAJOR.MINOR.PATCH`.
5. **Follow Best Practices**:
   - Ensure clean console/lint states, correct file naming conventions, and proper design token usage before finalizing the push.

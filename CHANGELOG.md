# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2026-08-27

### Added
- Integration of `sileo` physics-based toast notifications across all user actions (creation, editing, status transitions, deletion, and validation feedback).
- Global `<Toaster position="top-right" />` notification provider in frontend application.
- Standardized notification feedback in `usePromotions`, `useCategories`, and `PromotionFormModal`.

### Changed
- Refactored notification architecture away from inline banners to floating interactive toasts.
- Updated `AGENTS.md` and release workflow specifications to align with Node.js and TypeScript technology stack.

## [1.0.0] - 2026-08-27

### Added
- Complete Promotions Management Module for Retail POS (Kódigo Fuente).
- Backend REST API built with Node.js, Express, TypeScript, and Prisma ORM.
- PostgreSQL 16 relational database integration with `Category` and `Promotion` models.
- Active healthcheck endpoint `GET /health` with `SELECT 1` live database verification.
- Frontend Single Page Application built with React 19, Vite, TypeScript, Tailwind CSS, and HeroUI.
- Real-time KPI summary dashboard (`Programmed`, `Active`, `Finished`, and `Valid Today`).
- Multi-container Docker orchestration (`docker compose up --build -d`) with PostgreSQL, Node.js backend, and Nginx frontend.
- 3-stage CI/CD pipeline in GitHub Actions (`lint-and-test` -> `docker-build` -> `smoke-test`).
- Formal Architecture Decision Records in `DECISIONS.md`.

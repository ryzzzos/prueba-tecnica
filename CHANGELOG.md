# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.2] - 2026-08-28

### Added
- Isolated database migration `20260828010000_add_promotion_scopes` for robust multi-scope relations and junction tables.

## [1.1.1] - 2026-08-28

### Changed
- Refactored `PromotionFormModal` to leverage React Portals (`createPortal`) for reliable viewport layering and fixed overlay rendering across mobile and desktop breakpoints.
- Enhanced `CatalogPage` integration in the primary navigation layout, connecting real-time products and category scopes in the promotion builder.
- Configured ESLint 9 Flat Config in backend and unified typecheck scripts across workspace.
- Updated GitHub Actions CI concurrency rules to optimize pipeline runs.

## [1.1.0] - 2026-08-28

### Added
- Complete Product Catalog Module in backend (`ProductService`, `ProductRepository`, `ProductController`, `ProductRoutes`) with SKU validation, stock alerts, and category filtering.
- Frontend Product Catalog management interface (`CatalogPage`, `CatalogList`, `CatalogHeader`, `CatalogFilters`, `ProductFormModal`, `ProductActionsMenu`).
- Interactive Category Management Modal (`ProductCategoriesModal`) and Category Overview (`CategoryOverviewView`) with dynamic product counts.
- Reusable UI component library strictly complying with Design Tokens (`CustomSelect`, `MultiSelect`, `KpiCard`, `DataTable`, `Input`, `Tooltip`, `NumberTicker`, `AppIcon`, `BrandLogo`).
- Real-time Promotion Metric Grid (`PromotionMetricGrid`) with spring physics animations and ticker counters.
- Development Docker Compose environment (`docker-compose.dev.yml`, `backend/Dockerfile.dev`, `frontend/Dockerfile.dev`) supporting Vite HMR and `tsx watch` hot reload.
- Comprehensive unit test suite for Product domain validations (`backend/tests/product.service.spec.ts`).
- PostgreSQL schema migration `20260828000000_add_products` and seed expansion for products.

### Changed
- Refactored `PromotionFormModal`, `PromotionTable`, and `PromotionFilters` to leverage custom animated dropdowns and semantic tokens without native select elements.
- Enhanced `globals.css` with semantic surfaces, elevated card shadows, and proportional nested border radii.
- Updated `README.md` with complete documentation for Promotions, Products, and Categories REST APIs.

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

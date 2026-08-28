# Modulo de Gestion de Promociones (Kodigo Fuente POS)

Sistema web para el registro, consulta y control del ciclo de vida de promociones y descuentos en puntos de venta (POS), garantizando el cumplimiento de vigencias temporales, transiciones de estado e inmutabilidad de registros finalizados.

---

## Tech Stack

* **Backend:** Node.js (TypeScript) + Express + Prisma ORM + PostgreSQL 16.
* **Frontend:** React 19 + Vite + TypeScript + Tailwind CSS + HeroUI (`@heroui/react`) + Framer Motion.
* **DevOps / Infraestructura:** Docker (Multi-stage builds) + Docker Compose + Nginx (SPA Server).
* **Testing:** Vitest (Pruebas unitarias con 100% de cobertura de reglas de negocio).
* **CI/CD:** GitHub Actions (Pipeline con validacion de tipos, tests, build de imagenes y smoke testing contra `/health`).

---

## Arquitectura del Proyecto

```text
.
├── .github/
│   └── workflows/
│       └── ci.yml               # Pipeline de GitHub Actions (Lint, Test, Build, Smoke Test)
├── backend/                     # API REST en Node.js + Express + TypeScript + Prisma
│   ├── prisma/                  # Esquema relacional, migraciones SQL y semilla
│   ├── src/
│   │   ├── config/              # Variables de entorno y validacion fail-fast con Zod
│   │   ├── controllers/         # Controladores HTTP (Health, Categories, Promotions)
│   │   ├── middlewares/         # Manejo centralizado de errores y logger
│   │   ├── repositories/        # Capa de persistencia con Prisma Client
│   │   ├── routes/              # Definicion de rutas REST
│   │   ├── schemas/             # Esquemas de validacion Zod
│   │   └── services/            # Logica de negocio y maquina de estados
│   ├── tests/                   # Suite de pruebas unitarias con Vitest
│   └── Dockerfile               # Multi-stage build para produccion
├── frontend/                    # Single Page Application en React + Vite + HeroUI
│   ├── src/
│   │   ├── components/          # Componentes HeroUI (Navbar, KPIs, Table, Modals, Filters)
│   │   ├── hooks/               # Custom hooks de reactividad (usePromotions, useCategories)
│   │   ├── services/            # Cliente HTTP tipado y servicios API
│   │   ├── styles/              # Design tokens y variables CSS (globals.css)
│   │   └── types/               # Tipos e interfaces TypeScript
│   ├── Dockerfile               # Compilacion y servidor Nginx
│   └── nginx.conf               # Configuracion de Nginx con soporte SPA
├── docker-compose.yml           # Orquestacion de contenedores (db, backend, frontend)
├── .env.example                 # Plantilla de variables de entorno (sin credenciales)
├── DECISIONS.md                 # Registro formal de decisiones de arquitectura (ADRs)
└── AGENTS.md                    # Estandares de ingenieria y convenciones del proyecto
```

---

## Ejecucion con Docker Compose

Existen dos entornos configurados mediante Docker:

### A. Modo Desarrollo con Hot Reload (Recomendado para programar)
Permite hacer cambios en el codigo fuente y ver las actualizaciones en tiempo real sin reiniciar contenedores:

```bash
docker compose -f docker-compose.dev.yml up --build
```

* **Frontend (Vite HMR):** [http://localhost:5173](http://localhost:5173) (detecta cambios en vivo con recarga instantanea).
* **Backend (tsx watch):** [http://localhost:8000](http://localhost:8000) (reinicia automaticamente al guardar archivos TypeScript).
* **Base de datos (PostgreSQL 16):** Puerto `5432`.

### B. Modo Produccion (Compilado y optimizado con Nginx)
Simula el despliegue final en un servidor de produccion:

```bash
docker compose up --build -d
```

* **Frontend (Nginx SPA):** [http://localhost:3000](http://localhost:3000) (assets comprimidos y optimizados).
* **Backend (Node.js dist):** [http://localhost:8000](http://localhost:8000).
* **Healthcheck:** [http://localhost:8000/health](http://localhost:8000/health).

---

## Ejecucion Local en Desarrollo

### Requisitos previos
* Node.js v20+
* pnpm v10+ (`npm install -g pnpm`)
* Instancia local de PostgreSQL corriendo

### 1. Backend
```bash
cd backend
cp .env.example .env   # Ajustar DATABASE_URL a tu instancia local
pnpm install
pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:seed
pnpm dev
```
Servidor backend disponible en `http://localhost:8000`.

### 2. Frontend
```bash
cd frontend
pnpm install
pnpm dev
```
Aplicación disponible en `http://localhost:5173`.

---

## Pruebas Automatizadas

### Ejecutar Pruebas Unitarias del Backend (Vitest)
```bash
cd backend
pnpm test
```

### Validacion de Tipos (TypeScript)
```bash
# Backend
cd backend && pnpm tsc --noEmit

# Frontend
cd frontend && pnpm build
```

---

## Endpoints de la API REST

### Modulo de Promociones
| Metodo | Endpoint | Descripcion |
| :--- | :--- | :--- |
| `GET` | `/health` | Healthcheck que verifica conectividad activa con PostgreSQL |
| `GET` | `/api/v1/promotions/summary` | Metricas en tiempo real (conteo por estados y vigentes hoy) |
| `GET` | `/api/v1/promotions` | Listado de promociones (filtros: `status`, `categoryId`, `search`) |
| `POST` | `/api/v1/promotions` | Registro de una nueva promocion con validaciones |
| `GET` | `/api/v1/promotions/:id` | Consulta detallada de una promocion |
| `PUT` | `/api/v1/promotions/:id` | Modificacion de promocion (restringido si esta `FINALIZADA`) |
| `PATCH` | `/api/v1/promotions/:id/status` | Transicion de estado (`PROGRAMMED` -> `ACTIVE` -> `FINISHED`) |
| `DELETE` | `/api/v1/promotions/:id` | Eliminacion (permitida **unicamente** en estado `PROGRAMMED`) |

### Modulo de Catalogo y Productos
| Metodo | Endpoint | Descripcion |
| :--- | :--- | :--- |
| `GET` | `/api/v1/products/metrics` | Metricas del catalogo (total, activos, bajo stock, valor) |
| `GET` | `/api/v1/products` | Listado de productos (filtros: `search`, `categoryId`, `active`, `lowStock`) |
| `GET` | `/api/v1/products/:id` | Consulta de producto por ID |
| `POST` | `/api/v1/products` | Creacion de producto con SKU unico y validacion |
| `PUT` | `/api/v1/products/:id` | Actualizacion de producto |
| `PATCH` | `/api/v1/products/:id/toggle` | Alternar estado de activacion de producto |
| `DELETE` | `/api/v1/products/:id` | Eliminacion segura de producto |

### Modulo de Categorias
| Metodo | Endpoint | Descripcion |
| :--- | :--- | :--- |
| `GET` | `/api/v1/categories` | Listado de categorias comerciales con conteo de productos |
| `GET` | `/api/v1/categories/:id` | Consulta de categoria individual |
| `POST` | `/api/v1/categories` | Creacion de nueva categoria comercial |
| `PUT` | `/api/v1/categories/:id` | Actualizacion de categoria |
| `DELETE` | `/api/v1/categories/:id` | Eliminacion de categoria (valida dependencias) |

---

## Reglas de Negocio Implementadas

1. **Campos Obligatorios:** Nombre, categoria asociada y valor de descuento son estrictamente requeridos.
2. **Control Temporal:** La `fecha de fin` debe ser estrictamente posterior a la `fecha de inicio`.
3. **Validacion de Porcentajes:** Para descuentos porcentuales, el valor debe encontrarse en el rango cerrado $[1, 100]$. Para montos fijos, debe ser mayor a 0.
4. **Inmutabilidad de Finalizadas:** Una promocion en estado `Finalizada` no puede ser modificada ni reactivada.
5. **Restriccion de Eliminacion:** Solo se pueden eliminar promociones en estado `Programada`. Intentar eliminar una promocion `Activa` o `Finalizada` retorna `400 Bad Request`.
6. **Calculo de Vigentes Hoy:** Identifica dinamicamente si una promocion esta en estado `Activa` y la fecha actual se encuentra dentro del rango `[fecha_inicio, fecha_fin]`.

---

## Registro de Decisiones de Arquitectura (ADR)
Para una explicacion detallada sobre las decisiones tecnicas, trade-offs, seguridad y seleccion de herramientas, consulta el archivo [DECISIONS.md](file:///c:/Users/development/Documents/visual/prueba-tecnica/DECISIONS.md).
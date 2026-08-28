# Modulo de Gestion de Promociones y Catalogo Comercial (POS)

Sistema web de nivel empresarial para el registro, administracion y control del ciclo de vida de promociones, categorias y catalogo de productos en puntos de venta (POS). Disenado con una arquitectura desacoplada por capas, tipado estricto de extremo a extremo, precision financiera en base de datos y una experiencia de usuario inspirada en estandares de diseno de Apple.

---

## Aspectos Destacados de Ingenieria

* **Precision Financiera sin Punto Flotante:** Almacenamiento y calculo monetario mediante el tipo `Decimal(10, 2)` en PostgreSQL y Prisma, mitigando imprecisiones de redondeo de la norma IEEE 754.
* **Motor de Validacion de Solapamiento Comercial:** Algoritmo que detecta colisiones de fechas en tiempo real e impide que un producto tenga multiples descuentos activos o programados simultaneamente (tanto por asignacion directa como heredada por categorias).
* **Alcance Comercial Flexible (Multi-Scope):** Capacidad de aplicar reglas comerciales a nivel masivo por departamentos/categorias o de forma granular a listas de productos individuales.
* **Validacion Fail-Fast con Zod:** Esquemas de validacion en tiempo de arranque para variables de entorno y en cada endpoint REST para contratos de entrada/salida.
* **Healthcheck Activo (Liveness + Readiness):** Endpoint `GET /health` que ejecuta una consulta activa contra PostgreSQL (`SELECT 1`), informando latencia en milisegundos, estado de conectividad y tiempo de actividad (*uptime*).
* **Base de Datos Autosembrada:** Scripts de migracion (`prisma migrate deploy`) y seed idempotente (`prisma db seed`) ejecutados automaticamente al iniciar contenedores Docker.
* **Frontend React 19 con Design Tokens:** Diseno reactivo en tema claro y oscuro con variables CSS semanticas, microinteracciones con Framer Motion y modales montados en React Portals.
* **Pipeline de CI/CD con Smoke Testing:** Flujo automatizado en GitHub Actions con validacion estricta de tipos, pruebas unitarias, build de imagenes Docker y verificacion de disponibilidad en vivo.

---

## Tech Stack

| Capa | Tecnologias Principales |
| :--- | :--- |
| **Backend** | Node.js 20+, TypeScript 5, Express, Prisma ORM, PostgreSQL 16, Zod, Vitest |
| **Frontend** | React 19, Vite, TypeScript, Tailwind CSS, HeroUI (`@heroui/react`), Framer Motion, Sileo |
| **DevOps / Infra** | Docker (Multi-stage builds), Docker Compose, Nginx Alpine (SPA Server con Gzip) |
| **CI/CD & Calidad** | GitHub Actions, Vitest (100% de reglas de negocio), ESLint, TypeScript Strict Mode |

---

## Arquitectura del Repositorio

El proyecto sigue una estructura limpia y desacoplada respetando la separacion de responsabilidades:

```text
.
├── .github/
│   └── workflows/
│       └── ci.yml               # Pipeline CI/CD (Lint, Test, Build, Smoke Test)
├── backend/                     # API REST en Node.js + Express + TypeScript + Prisma
│   ├── prisma/                  # Esquema relacional, migraciones SQL y semilla
│   │   ├── migrations/          # Historial determinista de migraciones SQL
│   │   ├── schema.prisma        # Modelado relacional (Promotions, Categories, Products)
│   │   └── seed.ts              # Semilla automatica con categorias y productos POS
│   ├── src/
│   │   ├── config/              # Variables de entorno validadas con Zod
│   │   ├── controllers/         # Controladores HTTP (Promotions, Products, Categories, Health)
│   │   ├── middlewares/         # Manejo global de excepciones y logger estructurado
│   │   ├── repositories/        # Capa de persistencia con Prisma Client
│   │   ├── routes/              # Definicion y versionamiento de endpoints (/api/v1/...)
│   │   ├── schemas/             # Contratos Zod para validacion de payloads
│   │   ├── services/            # Logica de dominio, maquina de estados y validacion de solapamientos
│   │   └── app.ts               # Ensamblado de Express y configuracion de middlewares
│   ├── tests/                   # Pruebas unitarias de servicios con Vitest (100% aprobadas)
│   ├── Dockerfile               # Multi-stage build optimizado para produccion
│   └── Dockerfile.dev           # Contenedor de desarrollo con tsx watch y auto-seed
├── frontend/                    # Single Page Application con React 19 + Vite + Tailwind
│   ├── src/
│   │   ├── components/          # Componentes modulares (Promotions, Catalog, Layout, UI)
│   │   ├── hooks/               # Custom hooks reactivos (usePromotions, useProducts, useCategories)
│   │   ├── services/            # Capa de servicios HTTP tipada (Axios / Fetch)
│   │   ├── styles/              # Design Tokens y variables CSS (globals.css)
│   │   └── types/               # Definiciones e interfaces de TypeScript
│   ├── Dockerfile               # Build de produccion y servidor web Nginx
│   ├── Dockerfile.dev           # Contenedor con Vite Dev Server y Hot Module Replacement
│   └── nginx.conf               # Servidor Nginx con soporte de rutas SPA y compresion
├── docker-compose.yml           # Entorno de produccion multi-contenedor
├── docker-compose.dev.yml       # Entorno de desarrollo local con Hot Reload
├── .env.example                 # Variables de entorno documentadas (sin credenciales)
├── DECISIONS.md                 # Registro de Decisiones de Arquitectura (ADR-001 a ADR-012)
└── AGENTS.md                    # Estandares de ingenieria y convenciones de desarrollo
```

---

## Ejecucion Inmediata con Docker

### Opcion A: Modo Desarrollo con Hot Reload (Recomendado para evaluacion)
Monta los volumenes locales y permite ver cambios de codigo en tiempo real sin reconstruir contenedores:

```bash
docker compose -f docker-compose.dev.yml up --build
```

* **Frontend:** [http://localhost:5173](http://localhost:5173) (Vite HMR en vivo).
* **Backend:** [http://localhost:8000](http://localhost:8000) (Recarga automatica con `tsx watch`).
* **Healthcheck:** [http://localhost:8000/health](http://localhost:8000/health).
* **PostgreSQL:** Puerto `5432` (Tablas y datos iniciales creados automaticamente).

### Opcion B: Modo Produccion (Compilado y optimizado con Nginx)
Simula el despliegue final optimizado en un servidor real:

```bash
docker compose up --build -d
```

* **Frontend:** [http://localhost:3000](http://localhost:3000) (Servido por Nginx Alpine).
* **Backend:** [http://localhost:8000](http://localhost:8000) (JavaScript nativo compilado).

---

## Ejecucion Local sin Docker (Paso a Paso)

### Requisitos Previos
* Node.js v20+
* pnpm v10+ (`npm install -g pnpm`)
* Instancia local o remota de PostgreSQL 16 activa

### 1. Configuracion del Backend
```bash
cd backend
cp .env.example .env

# Configurar DATABASE_URL en el archivo .env si difiere del valor por defecto
pnpm install
pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:seed
pnpm dev
```
Servidor backend listo en `http://localhost:8000`.

### 2. Configuracion del Frontend
```bash
cd frontend
pnpm install
pnpm dev
```
Aplicacion cliente lista en `http://localhost:5173`.

---

## Pruebas Automatizadas y Calidad de Codigo

### Pruebas Unitarias del Backend (Vitest)
Se cuenta con una suite completa de pruebas unitarias que validan exhaustivamente la maquina de estados, reglas de descuento, inmutabilidad y deteccion de solapamientos:

```bash
cd backend
pnpm test
```

### Verificacion Estricta de Tipos (TypeScript)
```bash
# Validacion en Backend
cd backend && pnpm tsc --noEmit

# Validacion en Frontend
cd frontend && pnpm build
```

---

## Matriz de Reglas de Negocio Implementadas

| Regla | Descripcion | Comportamiento del Sistema |
| :--- | :--- | :--- |
| **Campos Obligatorios** | Nombre, tipo de descuento, valor y vigencia son obligatorios. | Rechaza con `400 Bad Request` y mensaje Zod descriptivo. |
| **Control Temporal** | `endDate` debe ser estrictamente posterior a `startDate`. | Validado en backend (Zod / Service) y en frontend en vivo. |
| **Rango de Porcentaje** | Descuentos porcentuales deben estar en el intervalo $[1, 100]$. | Validacion numerica estricta. Montos fijos deben ser $> 0$. |
| **Maquina de Estados** | Estados: `PROGRAMMED` (Programada), `ACTIVE` (Activa), `FINISHED` (Finalizada). | Transiciones controladas mediante endpoint `PATCH /status`. |
| **Inmutabilidad** | Las promociones en estado `FINISHED` son de solo lectura. | Cualquier intento de modificacion (`PUT`) es bloqueado con error `400`. |
| **Restriccion de Eliminacion** | Solo se pueden eliminar promociones en estado `PROGRAMMED`. | Eliminar promociones `ACTIVE` o `FINISHED` es rechazado con error `400`. |
| **Descuento Unico por Producto** | Un producto no puede tener mas de una promocion activa o programada solapada en fechas. | El servicio analiza colisiones temporales y bloquea solapamientos. |
| **Calculo de Vigentes Hoy** | Identificacion en tiempo real de ofertas activas en la fecha actual. | Computado dinamicamente para el panel de KPIs en el POS. |

---

## Endpoints de la API REST

### 1. Modulo de Promociones (`/api/v1/promotions`)
| Metodo | Endpoint | Descripcion |
| :--- | :--- | :--- |
| `GET` | `/health` | Healthcheck con verificacion activa de base de datos (`SELECT 1`) |
| `GET` | `/api/v1/promotions/summary` | Resumen de KPIs (Total, Activas, Programadas, Finalizadas, Vigentes Hoy) |
| `GET` | `/api/v1/promotions` | Listado paginado con filtros (`status`, `categoryId`, `search`) |
| `POST` | `/api/v1/promotions` | Creacion de promocion con validacion de solapamiento |
| `GET` | `/api/v1/promotions/:id` | Consulta de detalle por ID |
| `PUT` | `/api/v1/promotions/:id` | Modificacion de datos (restringido si esta `FINISHED`) |
| `PATCH` | `/api/v1/promotions/:id/status` | Transicion manual de estado del ciclo de vida |
| `DELETE` | `/api/v1/promotions/:id` | Eliminacion segura (solo permitida si esta `PROGRAMMED`) |

### 2. Modulo de Catalogo y Productos (`/api/v1/products`)
| Metodo | Endpoint | Descripcion |
| :--- | :--- | :--- |
| `GET` | `/api/v1/products/metrics` | Resumen estadistico del catalogo (total, activos, inventario valorizado) |
| `GET` | `/api/v1/products` | Catalogo de productos con filtros (`search`, `categoryId`, `active`) |
| `GET` | `/api/v1/products/:id` | Consulta de producto por identificador UUID |
| `POST` | `/api/v1/products` | Registro de nuevo producto comercial con SKU unico |
| `PUT` | `/api/v1/products/:id` | Actualizacion de datos de producto |
| `PATCH` | `/api/v1/products/:id/toggle` | Alternar estado de activacion en punto de venta |
| `DELETE` | `/api/v1/products/:id` | Eliminacion segura de producto |

### 3. Modulo de Categorias Comerciales (`/api/v1/categories`)
| Metodo | Endpoint | Descripcion |
| :--- | :--- | :--- |
| `GET` | `/api/v1/categories` | Listado de categorias con conteo de productos vinculados |
| `GET` | `/api/v1/categories/:id` | Consulta de categoria individual |
| `POST` | `/api/v1/categories` | Creacion de nueva categoria departamental |
| `PUT` | `/api/v1/categories/:id` | Actualizacion de nombre o descripcion |
| `DELETE` | `/api/v1/categories/:id` | Eliminacion segura con restriccion referencial |

---

## Pipeline de CI/CD (GitHub Actions)

El repositorio incluye un flujo automatizado de integracion continua (`.github/workflows/ci.yml`) estructurado en 3 etapas secuenciales:

1. **`lint-and-test`:** Verificacion estricta de tipos en TypeScript (`tsc --noEmit`), validacion de estilo y ejecucion de la suite de pruebas con Vitest.
2. **`docker-build`:** Construccion y verificacion de las imagenes Docker multi-stage de backend y frontend.
3. **`smoke-test`:** Despliegue automatizado con `docker compose up -d`, verificacion de que los contenedores arranquen de forma no interactiva y sondeo activo al endpoint `/health` esperando respuesta `200 OK`.

---

## Registro de Decisiones de Arquitectura (ADRs)

Para un desglose detallado de los fundamentos tecnicos, trade-offs, seguridad y seleccion de herramientas, consulta el documento [DECISIONS.md](file:///c:/Users/development/Documents/visual/prueba-tecnica/DECISIONS.md) que contiene los registros del **ADR-001 al ADR-012**.
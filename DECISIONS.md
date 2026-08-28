# Architecture Decision Records (ADR) — Módulo de Gestión de Promociones

Este documento recopila de manera formal y justificada las decisiones de arquitectura, diseño de software, patrones de ingeniería y selección de tecnologías adoptadas en el proyecto.

---

## ADR-001: Gestor de Paquetes — `pnpm` sobre `npm` / `yarn`

### Contexto
Se requiere un gestor de paquetes rápido, eficiente en el uso de almacenamiento y compatible con pipelines de CI/CD basados en Docker y GitHub Actions.

### Decisión
Adoptar **`pnpm`** (versión 10+) tanto para backend como frontend.

### Justificación
1. **Rendimiento e Instalación Determinista:** Almacenamiento basado en *hard links* y contenido direccionable, reduciendo los tiempos de instalación hasta en un 60% frente a `npm` en pipelines de CI.
2. **Aislamiento de Dependencias (No Phantom Dependencies):** Estructura estricta de `node_modules` que impide que el código acceda a paquetes transitivos no declarados en `package.json`, elevando la confiabilidad del build.
3. **Eficiencia en Contenedores Docker:** Menor huella de disco al construir capas multi-stage.

---

## ADR-002: Base de Datos Relacional y Precisión Numérica (PostgreSQL + Prisma)

### Contexto
La gestión de promociones para puntos de venta (POS) involucra transacciones comerciales, porcentajes y relaciones estrictas entre categorías de productos y reglas de descuento. La prueba exige un mínimo de 2 tablas/colecciones.

### Decisión
Adoptar **PostgreSQL 16** gestionado mediante **Prisma ORM** con tipos **`Decimal(10, 2)`** para los montos de descuento e identificadores únicos basados en **UUID**.

### Justificación
1. **Integridad Referencial y Restricciones:** PostgreSQL ofrece soporte nativo para claves foráneas con políticas de eliminación (`onDelete: Restrict`), garantizando que no se eliminen categorías con promociones asociadas.
2. **Precisión Financiera (Evitar Floating Point Issues):** El tipo `Decimal(10,2)` previene imprecisiones de redondeo de punto flotante IEEE 754 comunes al usar `FLOAT`/`DOUBLE` en cálculos de descuentos monetarios.
3. **Type-Safety de Extremo a Extremo:** Prisma genera tipos TypeScript 1:1 con el esquema, eliminando discrepancias entre el modelo en base de datos y la capa de aplicación.

---

## ADR-003: Validación Fail-Fast de Variables de Entorno (Zod)

### Contexto
En arquitecturas distribuidas y entornos Docker/CI-CD, arranques con configuraciones incompletas o variables ausentes (`DATABASE_URL`, `PORT`) provocan fallos tardíos en tiempo de ejecución (*runtime*) difíciles de diagnosticar.

### Decisión
Implementar un módulo de configuración centralizado (`src/config/env.ts`) que valida todas las variables requeridas usando **Zod** durante la inicialización del proceso antes de levantar el servidor HTTP.

### Justificación
1. **Principio Fail-Fast:** Si falta una variable crítica o el formato es inválido (ej. URL mal formada), el proceso se detiene inmediatamente con un log explicativo legible.
2. **Seguridad y Tipado:** Proporciona un objeto `env` fuertemente tipado e inmutable para el resto de la aplicación.

---

## ADR-004: Diseño y Comportamiento del Endpoint de Salud (`GET /health`)

### Contexto
El requerimiento obligatorio exige que `/health` responda `200 OK` únicamente cuando la aplicación y su conexión a la base de datos estén 100% operativas.

### Decisión
El endpoint `/health` ejecuta una consulta activa (`SELECT 1` de base de datos a través de Prisma) antes de responder `200 OK`. Si la base de datos está caída o inaccesible, el endpoint retorna `503 Service Unavailable` con el detalle del servicio degradado.

### Justificación
1. **Verificación Real de Disponibilidad (Liveness + Readiness):** Garantiza que los balanceadores de carga, Docker Compose healthchecks y el pipeline de CI/CD solo consideren el servicio como disponible cuando puede procesar lecturas/escrituras en BD.
2. **Estructura Estándar de Monitoreo:**
   ```json
   {
     "status": "ok",
     "timestamp": "2026-08-27T16:00:00.000Z",
     "services": {
       "database": {
         "status": "connected",
         "latencyMs": 3
       }
     },
     "uptime": 45.2
   }
   ```

---

## ADR-005: Estándar de Código Limpio, Logging Estructurado y Política Cero Emojis

### Contexto
El software de nivel empresarial y los pipelines automatizados de observabilidad requieren logs limpios, parseables e independientes de caracteres decorativos o incompatibilidades de terminales / codificación UTF.

### Decisión
Establecer una política estricta de **cero emojis** en la totalidad del repositorio (código fuente, comentarios, logs de servidor, mensajes de commit, documentación y respuestas de API). El logging utiliza identificadores estándar por nivel: `[INFO]`, `[WARN]`, `[ERROR]`, `[FATAL]`, `[SUCCESS]`.

### Justificación
1. **Observabilidad y Compatibilidad en CI/CD:** Los parsers de logs (CloudWatch, Datadog, ELK, GitHub Actions runners) procesan sin ambigüedad texto plano estructurado.
2. **Profesionalismo y Calidad de Código:** Alineación con estándares de código de producción de alta exigencia corporativa.

---

## ADR-006: Arquitectura en Capas y Patrones de Backend en Node.js (TypeScript)

### Contexto
La lógica de negocio de promociones posee reglas e invariantes complejas (máquinas de estado, validación de porcentajes, inmutabilidad de promociones finalizadas, restricciones de eliminación condicional).

### Decisión
Adoptar una arquitectura limpia y modular desacoplada por capas:
- `routes/`: Enrutamiento y vinculación de middlewares.
- `controllers/`: Manejo de peticiones HTTP, extracción de parámetros y respuestas.
- `services/`: Lógica de dominio pura, validación de reglas de negocio y transiciones de estado.
- `repositories/`: Capa de persistencia y consultas Prisma aisladas.
- `schemas/`: Validación de contratos de entrada y salida con Zod.

### Justificación
1. **Testeabilidad Aislada:** Los servicios pueden ser testeados de manera unitaria con mocks de repositorios sin necesidad de levantar el servidor Express o la base de datos.
2. **Mantenibilidad y Escalabilidad:** Cambios en el transporte HTTP o en el motor de persistencia no afectan las reglas de negocio de la aplicación.

---

## ADR-007: Arquitectura Frontend, Vite y Sistema de Tokens Visuales (Design Tokens)

### Contexto
Se requiere una interfaz de usuario de alto impacto, receptiva y con consistencia visual rigurosa sin depender de valores hardcodeados de estilos arbitrarios.

### Decisión
Estructurar el frontend en **React 19 + Vite + TypeScript + Tailwind CSS** utilizando un sistema formal de **Design Tokens** centralizados mediante variables CSS en `globals.css` (`--surface-*`, `--border-*`, `--shadow-*`, `--radius-*`, `--text-*`, `--color-*`).

### Justificación
1. **Consistencia Visual y Escalabilidad:** Los componentes consumen variables semánticas centralizadas, permitiendo soporte nativo para temas (Light/Dark mode) y armonía geométrica de radios de borde.
2. **Performance y Velocidad de Bundling:** Vite proporciona *Hot Module Replacement* (HMR) ultrarrápido con compilaciones optimizadas mediante Rollup/esbuild.
3. **Cero Estilos Hardcodeados:** Previene divergencias visuales en badges, sombras y modales a lo largo de la aplicación.

---

## ADR-008: Adopción de HeroUI (React Aria + Framer Motion) para la Capa de Componentes UI

### Contexto
El desarrollo de interfaces de usuario para módulos de gestión comercial requiere componentes interactivos complejos (tablas con ordenamiento, modales, drawers, selects personalizados accesibles y badges de estado) que cumplan con altos estándares de usabilidad y accesibilidad sin reinventar componentes atómicos desde cero.

### Decisión
Integrar **HeroUI (`@heroui/react`)** sobre Tailwind CSS y Framer Motion como la biblioteca base de componentes de interfaz de usuario.

### Justificación
1. **Accesibilidad Nativa (WAI-ARIA):** Construida sobre primitivos de React Aria, garantizando soporte completo de navegación por teclado, focus management y lectores de pantalla.
2. **Coherencia y Microinteracciones:** Se sincroniza perfectamente con el sistema de tokens CSS de `globals.css` y aporta animaciones fluidas impulsadas por Framer Motion.
3. **Time-to-Market y Mantenibilidad:** Reduce drásticamente la deuda técnica en el desarrollo de selectores, diálogos modales y tablas de datos, permitiendo focalizar el esfuerzo en la lógica de negocio y la experiencia de usuario.

---

## ADR-009: Orquestación Multi-Contenedor (Docker Compose) y Servidor Nginx para SPAs

### Contexto
El despliegue local y en entornos de staging debe ser determinista, aislado y reproducible mediante un único comando (`docker-compose up`). La aplicación frontend (SPA de Vite) requiere un servidor HTTP eficiente con soporte de enrutamiento del lado del cliente.

### Decisión
1. **Multi-Stage Builds:** Dockerfiles optimizados para backend y frontend, separando la fase de compilación de la fase de ejecución para reducir el tamaño de las imágenes finales.
2. **Servidor Nginx para Frontend:** Nginx Alpine para servir los archivos estáticos de Vite con compresión Gzip, caché de assets inmutables y directiva `try_files $uri $uri/ /index.html` para soportar navegación SPA.
3. **Orquestación con Healthchecks Coordinados:** `docker-compose.yml` gestiona `db`, `backend` y `frontend`, usando `depends_on: { condition: service_healthy }` para garantizar que el backend no intente conectarse antes de que PostgreSQL esté listo.

---

## ADR-010: Pipeline de CI/CD Automatizado con GitHub Actions y Smoke Testing Integrado

### Contexto
Se requiere garantizar que ningún cambio de código rompa la compilación, las pruebas unitarias o la disponibilidad del sistema en contenedores antes de llegar a ramas principales.

### Decisión
Implementar un pipeline de GitHub Actions (`.github/workflows/ci.yml`) con 3 etapas dependientes y secuenciales:
1. `lint-and-test`: Ejecución de verificación de tipos (TypeScript), linter y pruebas unitarias de backend (Vitest) y frontend.
2. `docker-build`: Construcción y validación de las imágenes Docker de backend y frontend.
3. `smoke-test`: Despliegue automatizado con `docker compose up -d`, sondeo de disponibilidad y verificación activa del endpoint `/health` esperando código `200 OK`. Si el status es diferente o hay fallas en base de datos, el pipeline falla de forma explícita.

---

## ADR-011: Estrategia de Migraciones y Semilla Automática en Producción (Prisma Migrate & Seed)

### Contexto
Al inicializar la base de datos en contenedores limpios, las tablas deben crearse de forma no interactiva y con datos base de categorías comerciales.

### Decisión
El contenedor de backend ejecuta en su secuencia de arranque `prisma migrate deploy` (equivalente de producción a `alembic upgrade head`) seguido de `prisma db seed` antes de iniciar el servidor Express.

### Justificación
1. **Despliegues Idempotentes:** Las migraciones registradas en `prisma/migrations` se aplican secuencialmente sin requerir intervención manual.
2. **Disponibilidad Inmediata de Datos:** Garantiza que el POS disponga de las categorías por defecto en el primer arranque.

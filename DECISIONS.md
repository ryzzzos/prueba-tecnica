# Architecture Decision Records (ADR) — Plataforma de Gestión de Promociones

En este documento recopilo y justifico las decisiones de arquitectura, diseño de software, patrones de ingeniería y selección de tecnologías que tomé a lo largo del desarrollo de este proyecto.

---

## ADR-001: Elección de `pnpm` como Gestor de Paquetes

### Contexto
Para este proyecto necesitaba un gestor de dependencias rápido, eficiente con el espacio en disco y confiable para los pipelines de CI/CD y los contenedores de Docker.

### Decisión
Elegí **`pnpm`** (versión 10+) tanto para el backend como para el frontend.

### Justificación
1. **Rendimiento e Instalación Determinista:** Gracias a su almacenamiento basado en *hard links* y contenido direccionable, reduje drásticamente los tiempos de instalación (hasta un 60% más rápido frente a `npm` en pipelines de CI).
2. **Aislamiento Estricto de Dependencias (*No Phantom Dependencies*):** `pnpm` crea una estructura estricta en `node_modules` que impide que el código acceda accidentalmente a dependencias transitivas no declaradas en el `package.json`, garantizando builds 100% predecibles.
3. **Eficiencia en Imágenes Docker:** Optimiza el almacenamiento al reutilizar paquetes en las capas de compilación multi-stage.

---

## ADR-002: Base de Datos Relacional y Precisión Financiera (PostgreSQL 16 + Prisma)

### Contexto
El sistema gestiona promociones, descuentos porcentuales y monetarios, productos y categorías comerciales para un punto de venta (POS). Los cálculos financieros y las relaciones de negocio exigían integridad referencial absoluta y tipos numéricos de alta precisión.

### Decisión
Opté por **PostgreSQL 16** gestionado a través de **Prisma ORM**, modelando los montos con el tipo **`Decimal(10, 2)`** e identificadores únicos basados en **UUID**.

### Justificación
1. **Integridad Referencial Estricta:** Implementé claves foráneas con restricciones (`onDelete: Restrict`) para asegurar que una categoría no pueda ser eliminada si tiene promociones o productos vinculados.
2. **Cero Errores de Punto Flotante:** Utilicé `Decimal(10, 2)` en lugar de `FLOAT`/`DOUBLE` para evitar los clásicos errores de redondeo de la norma IEEE 754 al calcular descuentos y precios de productos.
3. **Tipado Fuerte de Extremo a Extremo:** Prisma me genera tipos en TypeScript que sincronizan 1:1 la base de datos con la capa de servicios, eliminando discrepancias de datos.

---

## ADR-003: Validación Fail-Fast de Variables de Entorno con Zod

### Contexto
En despliegues con Docker o en la nube, arrancar una aplicación con variables de entorno faltantes o mal formadas suele generar errores tardíos en runtime que son difíciles de depurar.

### Decisión
Creé un módulo centralizado (`src/config/env.ts`) que valida todas las variables requeridas usando **Zod** en el momento exacto en que inicia el proceso, antes de levantar el servidor Express.

### Justificación
1. **Principio Fail-Fast:** Si falta alguna variable crítica (como `DATABASE_URL` o `PORT`) o si el formato es inválido, detengo el proceso de inmediato con un mensaje claro en la consola.
2. **Seguridad e Inmutabilidad:** Expongo un objeto `env` fuertemente tipado e inmutable para el resto del backend, evitando el uso disperso de `process.env`.

---

## ADR-004: Endpoint de Salud con Verificación Activa (`GET /health`)

### Contexto
El healthcheck debía reflejar el estado real de la aplicación y su conectividad con la base de datos, no solo responder un texto estático.

### Decisión
Diseñé el endpoint `/health` para que ejecute una consulta activa (`SELECT 1` mediante Prisma) a PostgreSQL antes de retornar `200 OK`. Si la base de datos no responde, retorno `503 Service Unavailable` indicando el servicio afectado.

### Justificación
1. **Monitoreo Real (Liveness & Readiness):** Permite que Docker Compose, los balanceadores de carga y los pipelines de CI/CD sepan con certeza cuándo el contenedor está verdaderamente listo para procesar tráfico.
2. **Estructura Estándar:** Devuelvo métricas de latencia de base de datos, estado y uptime en un JSON estructurado y fácil de consumir por herramientas de observabilidad.

---

## ADR-005: Estándar de Código Limpio, Logging Estructurado y Política Cero Emojis

### Contexto
Para mantener una calidad de nivel de producción corporativo, los logs y el código deben ser profesionales, limpios y fácilmente analizables por herramientas automáticas.

### Decisión
Adopté una política estricta de **cero emojis** en todo el repositorio (código, comentarios, logs, commits y documentación). En su lugar, implementé logs estructurados con etiquetas estándar: `[INFO]`, `[WARN]`, `[ERROR]`, `[FATAL]`, `[SUCCESS]`, `[DEBUG]`.

### Justificación
1. **Compatibilidad en CI/CD y Terminales:** Evita problemas de renderizado de caracteres UTF en entornos Linux/Docker y facilita el parseo de logs en herramientas como Datadog, CloudWatch o ELK.
2. **Legibilidad y Profesionalismo:** Garantiza un formato homogéneo y sobrio acorde a estándares de software empresarial.

---

## ADR-006: Arquitectura en Capas y Desacoplamiento en Node.js (TypeScript)

### Contexto
La lógica comercial de promociones incluye máquinas de estado (`PROGRAMMED` -> `ACTIVE` -> `FINISHED`), validación de vigencias temporales, restricciones de inmutabilidad y alcances por categorías o productos. Mezclar esto con el transporte HTTP o las consultas SQL crearía código espagueti difícil de mantener.

### Decisión
Organicé el backend bajo una arquitectura en capas limpias con inversión de dependencias:
- `routes/`: Define las rutas HTTP y asocia los middlewares.
- `controllers/`: Procesa peticiones, valida entradas con Zod y devuelve códigos de estado HTTP adecuados.
- `services/`: Contiene la lógica de negocio pura, la máquina de estados y las reglas de dominio.
- `repositories/`: Capa de persistencia que interactúa directamente con Prisma.
- `schemas/`: Contratos de validación de entrada/salida tipados con Zod.

### Justificación
1. **Pruebas Unitarias Aisladas:** Pude probar toda la lógica de los servicios con Vitest simulando los repositorios mediante mocks, sin necesidad de levantar Express ni la base de datos real.
2. **Mantenibilidad:** Si en el futuro se decide cambiar Prisma o Express, la lógica de negocio permanece intacta.

---

## ADR-007: Sistema de Diseño con Design Tokens y React 19 + Vite

### Contexto
Buscaba una interfaz moderna, limpia y pulida con influencia estética de Apple, que soportara modo claro y oscuro de manera nativa sin recurrir a colores ni sombras arbitrarias *hardcodeadas*.

### Decisión
Construí el frontend con **React 19**, **Vite** y **Tailwind CSS**, implementando un sistema formal de **Design Tokens** mediante variables CSS en `globals.css` (`--surface-*`, `--border-*`, `--shadow-*`, `--radius-*`, `--text-*`, `--color-*`).

### Justificación
1. **Consistencia Visual:** Todos los componentes consumen tokens semánticos, garantizando que el cambio entre tema claro y oscuro sea instantáneo y uniforme.
2. **Jerarquía Geométrica de Radios:** Definí una escala armónica donde los contenedores externos usan radios mayores (`rounded-2xl` / `rounded-xl`) y los elementos hijos internos escalan proporcionalmente hacia radios menores (`rounded-lg` / `rounded-md`).
3. **Velocidad de Desarrollo:** Vite me brindó un entorno de desarrollo con *Hot Module Replacement* (HMR) inmediato y compilaciones de producción altamente optimizadas.

---

## ADR-008: Componentes Interactivos con HeroUI, Framer Motion y React Portals

### Contexto
Los formularios de creación, edición y administración de categorías requerían una experiencia fluida sin saltos visuales, mientras que los modales y *drawers* no debían sufrir desalineaciones provocadas por contenedores padres o scroll.

### Decisión
Utilicé **HeroUI (`@heroui/react`)** junto con **Framer Motion** para las transiciones (`ease: [0.32, 0.72, 0, 1]`), y envolví los paneles deslizables (*Drawers*) en **React Portals (`createPortal`)** montados directamente en `document.body`.

### Justificación
1. **Accesibilidad WAI-ARIA:** Manejo nativo de foco, navegación por teclado y lectores de pantalla provisto por React Aria.
2. **Eliminación de Desplazamientos:** Montar los modales en el `body` a través de Portals evita que hereden paddings, márgenes o transformaciones de contenedores intermedios del dashboard, asegurando que cubran exactamente el 100% de la altura de la pantalla (`h-[100dvh]`).

---

## ADR-009: Regla de Descuento Único y Validación de Solapamiento Temporal

### Contexto
En el punto de venta, un mismo producto no puede tener dos promociones activas o programadas simultáneamente en el mismo rango de fechas, ya que generaría ambigüedad en el cálculo de la caja registradora.

### Decisión
Implementé una validación de negocio en el backend (`validateNoOverlappingDiscounts` en `promotion.service.ts`) y un aviso en tiempo real en el frontend que detecta colisiones de fechas tanto para asignaciones directas de productos como indirectas por categorías.

### Justificación
1. **Consistencia en el POS:** Se previene a nivel de base de datos y API que dos promociones apliquen al mismo producto en un rango de fechas coincidente (`[startDate, endDate]`).
2. **Experiencia de Usuario Proactiva:** El drawer de creación advierte al usuario antes de enviar el formulario si algún producto seleccionado ya cuenta con un descuento activo en ese horario.

---

## ADR-010: Despliegue Multi-Contenedor (Docker Compose) y Nginx para SPA

### Contexto
El proyecto debía ser 100% reproducible tanto en desarrollo local como en producción mediante un solo comando (`docker compose up`).

### Decisión
Configuré dos entornos con Docker Compose:
1. **Modo Desarrollo (`docker-compose.dev.yml`):** Con volúmenes montados y Hot Reload en vivo para frontend (Vite) y backend (`tsx watch`).
2. **Modo Producción (`docker-compose.yml`):** Con *multi-stage builds*, backend compilado a JavaScript nativo y frontend servido por un contenedor **Nginx Alpine** optimizado.

### Justificación
1. **Soporte Completo de SPA:** Configuré Nginx con `try_files $uri $uri/ /index.html` y compresión Gzip para que la navegación cliente funcione a la perfección sin errores 404 al recargar rutas.
2. **Orquestación Coordinada:** Utilicé `depends_on` condicionado al estado saludable (`service_healthy`) de PostgreSQL para que el backend nunca intente conectarse antes de que la base de datos esté lista.

---

## ADR-011: Pipeline de Integración Continua con GitHub Actions y Smoke Testing

### Contexto
Para garantizar que ningún cambio rompa el build o la funcionalidad, implementé un pipeline automatizado en cada *pull request* y *push* a la rama `main`.

### Decisión
Diseñé el workflow `.github/workflows/ci.yml` dividido en tres fases secuenciales:
1. `lint-and-test`: Typecheck estricto con TypeScript, linter y suite completa de pruebas unitarias en Vitest.
2. `docker-build`: Construcción y verificación de las imágenes Docker de backend y frontend.
3. `smoke-test`: Despliegue automatizado con `docker compose up -d`, sondeo de disponibilidad y consulta real al endpoint `/health` esperando código `200 OK`.

### Justificación
Garantiza que el código no solo compile y pase las pruebas unitarias, sino que el sistema completo sea capaz de levantarse, conectarse a PostgreSQL y responder peticiones reales dentro de contenedores Docker.

---

## ADR-012: Migraciones y Semilla Automática de Datos (Prisma Migrate & Seed)

### Contexto
Al inicializar el proyecto por primera vez en Docker, era indispensable que la base de datos creara sus tablas y se poblara automáticamente con un catálogo realista de categorías y productos sin requerir comandos manuales adicionales.

### Decisión
Configuré el script de entrada de los contenedores para que ejecute secuencialmente `prisma migrate deploy` (aplica las migraciones pendientes) y `prisma db seed` (inserta categorías comerciales y productos iniciales) antes de encender el servidor.

### Justificación
1. **Idempotencia:** Las migraciones registradas en `prisma/migrations` se aplican de manera ordenada y segura sin alterar datos existentes.
2. **Experiencia *Out-of-the-Box*:** Cualquier evaluador o reclutador que clone el repositorio y ejecute `docker compose up` encontrará la plataforma lista para usar con datos reales desde el primer segundo.

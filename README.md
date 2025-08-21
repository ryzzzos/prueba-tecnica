# README — Gestor de Eventos (FastAPI + Next.js)

---

# Índice
1. Descripción
2. Requisitos
3. Estructura importante del proyecto
4. Variables y configuración
5. Ejecutar en desarrollo (backend + frontend)
6. Endpoints (ejemplos `curl` / FormData)
7. Base de datos y migraciones
8. Tests sugeridos
9. Buenas prácticas y producción
10. Troubleshooting rápido
11. Checklist de entrega

---

# 1) Descripción
Aplicación para crear/listar eventos y registrar inscripciones.  
- Backend: FastAPI + SQLAlchemy (SQLite por defecto en dev).  
- Frontend: Next.js (app router) con componentes en TSX, CSS Modules y un `ToastProvider` global para notificaciones.  
- Archivos subidos (imágenes) se guardan en `uploads/` y se sirven estáticamente vía FastAPI.

---

# 2) Requisitos
- Python 3.10+ (probado con 3.11/3.13)  
- Node.js 18+ (o estable LTS)  
- pip, npm/yarn  
- (Opcional) Docker

---

# 3) Estructura importante (resumen)
```
backend/
  main.py                # crea tablas y monta router (/eventos)
  routers/
    eventos.py           # endpoints: crear, listar, asistencias
  models.py              # SQLAlchemy models: Evento, Inscripcion
  schemas.py             # Pydantic schemas
  database.py            # engine, SessionLocal, Base
  uploads/               # carpeta donde se guardan imágenes
frontend/
  src/app/
    eventos/
      crear/             # CrearEventoPage + CrearEventoForm
      listar/            # ListarEventos + ListarEventos.module.css
    components/
      ToastContext.tsx
      Boton3D.tsx
    layout.tsx
  package.json
```

> Nota: en tu proyecto real los paths pueden variar; ajusta según tu repo.

---

# 4) Variables / configuración
Para desarrollo no hay variables obligatorias. Recomendado:
- `DATABASE_URL` para usar otra DB (Postgres) en producción.
- `ALLOWED_ORIGINS` (frontend host) para CORS en producción.

---

# 5) Ejecutar en desarrollo

## Backend (FastAPI)
1. Crear y activar entorno virtual:
```bash
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate
```
2. Instalar dependencias (ejemplo):
```bash
pip install fastapi uvicorn sqlalchemy pydantic python-multipart
# si usas alembic / pytest:
pip install alembic pytest httpx
```
3. Ejecutar:
```bash
# desde la carpeta del backend donde está main.py
uvicorn main:app --reload --port 8000
```
- Swagger UI: `http://127.0.0.1:8000/docs`  
- Recomendación: revisa `main.py` (tienes `app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")`) — esa ruta sirve las imágenes.

## Frontend (Next.js)
1. Instalar dependencias:
```bash
cd frontend
npm install
# o
yarn
```
2. Ejecutar:
```bash
npm run dev
# o
yarn dev
```
- App: `http://localhost:3000`  
- Asegúrate de correr frontend y backend en terminales separadas.

---

# 6) Endpoints (resumen y ejemplos)

> **Prefijo**: tu `main.py` incluye router con `prefix="/eventos"`. Por eso las rutas reales son `http://localhost:8000/eventos/...`

## Crear evento (con imagen — FormData)
- `POST /eventos/crear`  
- Content-Type: `multipart/form-data`  
- Campos: `titulo`, `descripcion`, `fecha_hora` (ISO o `YYYY-MM-DDTHH:MM`), `lugar`, `imagen` (opcional file)

Ejemplo `curl`:
```bash
curl -X POST "http://127.0.0.1:8000/eventos/crear" \
  -F "titulo=Mi Evento" \
  -F "descripcion=Descripción aquí" \
  -F "fecha_hora=2025-09-09T17:00" \
  -F "lugar=Ciudad X" \
  -F "imagen=@/ruta/a/imagen.jpg"
```

Respuesta exitosa: JSON del evento creado (status 200/201 según tu código).

---

## Listar eventos futuros ordenados
- `GET /eventos/`  
- Devuelve lista filtrada por `fecha_hora >= ahora` y ordenada ascendente.

Ejemplo:
```bash
curl "http://127.0.0.1:8000/eventos/"
```

---

## Crear inscripción
- `POST /eventos/asistencias`  
- Body JSON: `{ "evento_id": 1, "nombre": "Ana", "correo": "ana@example.com" }`

Ejemplo `curl`:
```bash
curl -X POST "http://127.0.0.1:8000/eventos/asistencias" \
  -H "Content-Type: application/json" \
  -d '{"evento_id":1,"nombre":"Ana","correo":"ana@example.com"}'
```

Respuesta: objeto `Inscripcion`, o error 400 si ya existe (duplicado), 404 si evento no existe.

---

## Listar inscripciones por evento
- `GET /eventos/asistencias?eventoId=<ID>`  

Ejemplo:
```bash
curl "http://127.0.0.1:8000/eventos/asistencias?eventoId=1"
```

---

## Obtener imagen subida
Si la `imagen` guardada en DB es `uploads/1234abcd.jpg`, la URL pública será:
```
http://127.0.0.1:8000/uploads/1234abcd.jpg
```
> Nota: en frontend algunas rutas guardan `\` (backslash) en Windows; convierte a `/` antes de usar: `ruta.replace(/\\/g, "/")`.

---

# 7) Base de datos y migraciones

## Desarrollo rápido
Actualmente `main.py` ejecuta:
```py
Base.metadata.create_all(bind=engine)
```
Esto crea tablas automáticamente. Para cambios de esquema en producción usa Alembic.

## Recomendado: Alembic (migraciones)
1. `pip install alembic`  
2. `alembic init alembic` y configura `alembic.ini` para usar `DATABASE_URL`.  
3. Generar migración:
```bash
alembic revision --autogenerate -m "initial"
alembic upgrade head
```
### Ejemplo: agregar unique constraint `evento_id, correo` en inscripciones
- Modifica modelo para añadir `__table_args__ = (UniqueConstraint("evento_id","correo", name="uq_evento_correo"),)` y luego:
```bash
alembic revision --autogenerate -m "add unique evento_correo"
alembic upgrade head
```

Si no usas Alembic en dev y quieres forzar el esquema limpio:
```bash
# detener servidor
rm -f path/to/tu_db.sqlite3  # o borra el archivo sqlite
# luego volver a arrancar uvicorn; create_all recreará tablas
```

---

# 8) Tests sugeridos (básicos)
- Backend: `pytest` + `fastapi.testclient` / `httpx` para:
  - crear evento (sin/ con imagen),
  - listar eventos (filtrado por fecha),
  - inscribir (y evitar duplicado),
  - obtener inscripciones.
- Frontend: testeos de componentes (CrearEventoForm envía FormData; Toast aparece).

---

# 9) Producción — puntos clave
- No uses `allow_origins=["*"]` en CORS — restringe a tu dominio.  
- Guarda imágenes en S3/Cloud Storage en vez de disco local.  
- Usa una DB robusta (Postgres) y Alembic.  
- Poner detrás de proxy (nginx) para servir `/uploads` y app estática; configurar encabezados de caching.  
- TLS (HTTPS), CSP y cabeceras de seguridad.  
- Rate limit en endpoints de creación y envío de inscripciones.

---

# 10) Troubleshooting rápido

### 1) `Failed to fetch` desde frontend al llamar al backend
- ¿El backend corre en `http://127.0.0.1:8000`?  
- Revisa consola del backend para ver errores.  
- Verifica CORS en backend (en `main.py`) para permitir `localhost:3000` o `"*"` en dev.

### 2) Imagen no aparece en frontend
- Comprueba la ruta guardada en DB (si es `uploads\R.jpg` en Windows, en JS cambia `\` por `/` antes de construir URL).  
- Verifica que `app.mount("/uploads", StaticFiles(directory="uploads"), ...)` esté en `main.py`.  
- Abre `http://127.0.0.1:8000/uploads/tuarchivo.jpg` en navegador para probar.

### 3) Error SQL: `table eventos has no column named imagen`
- Significa que cambiaste modelos pero no migraste. Elimina DB en dev o crea migración Alembic y aplica `alembic upgrade head`.

### 4) Inscripciones duplicadas
- Agregar validación en backend (ya la tienes) **y** constraint en DB (unique constraint) para cobertura total en concurrencia.

### 5) Toast duplicado / keys duplicadas
- Usa IDs únicos (p. ej. `Date.now()` + counter o `crypto.randomUUID()`). Evita llamar `addToast` y luego lanzar error que provoque nuevo `catch` que vuelva a dispararlo.

---

# 11) Checklist de entrega (recomendado)
- [ ] README (este archivo) incluido en la raíz.  
- [ ] Instrucciones de instalación y ejecución claras.  
- [ ] Endpoint docs (Swagger) funcionan.  
- [ ] DB con migraciones (Alembic) o instrucción para recrear.  
- [ ] Tests mínimos incluidos.  
- [ ] Seguridad básica para uploads y validaciones.  
- [ ] Demo: pasos para probar (crear evento → listar → inscribir → ver asistentes).

---

## Ejemplos rápidos para probar flujo (resumen)
1. Levantar backend y frontend.  
2. En el front, ir a `/eventos/crear`, rellenar formulario con imagen, enviar.  
3. Ver `Evento creado` (toast), comprobar en `/eventos/listar` o `GET /eventos/`.  
4. Abrir evento, hacer click en **Ir**, completar nombre y correo → enviar (toast).  
5. Ver lista de asistentes en la tabla.

---

Si quieres, genero ahora:
- un `README.md` listo para pegar en la raíz con este contenido (ya lo tienes), o  
- añado el snippet exacto para `alembic` con `UniqueConstraint`, o  
- creo 2 tests `pytest` para: crear evento y evitar inscripción duplicada.


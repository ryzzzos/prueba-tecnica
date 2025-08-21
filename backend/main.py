from fastapi import FastAPI
from database import Base, engine
from routers import eventos
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles


# Crear tablas automáticamente en la base de datos
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Configuración de CORS (permite peticiones desde cualquier origen)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar las rutas relacionadas con eventos
app.include_router(eventos.router, prefix="/eventos", tags=["Eventos"])

# Servir archivos estáticos (imágenes subidas)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

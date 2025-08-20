from fastapi import FastAPI
from database import Base, engine
from routers import eventos
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles


# Crear tablas en la base de datos
Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Incluir el router de eventos
app.include_router(eventos.router, prefix="/eventos", tags=["Eventos"])

# Configurar el directorio estático para las imágenes
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

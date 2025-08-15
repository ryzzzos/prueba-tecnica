from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
import models, schemas
from database import engine, Base, get_db
from routers import eventos
from routers import eventos

app = FastAPI()

app.include_router(eventos.router, prefix="/eventos", tags=["Eventos"])


@app.get("/")
def read_root():
    return {"message": "backend listo"}


from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
import models, schemas
from database import engine, Base, get_db

# Crear las tablas en la base de datos
Base.metadata.create_all(bind=engine)

app = FastAPI()

# ======================
# Endpoint: Crear evento
# ======================
@app.post("/eventos/", response_model=schemas.Evento)
def crear_evento(evento: schemas.EventoCreate, db: Session = Depends(get_db)):
    nuevo_evento = models.Evento(
        titulo=evento.titulo,
        descripcion=evento.descripcion,
        fecha_hora=evento.fecha_hora,
        lugar=evento.lugar
    )
    db.add(nuevo_evento)
    db.commit()
    db.refresh(nuevo_evento)
    return nuevo_evento

# ======================
# Endpoint: Listar eventos
# ======================
@app.get("/eventos/", response_model=list[schemas.Evento])
def listar_eventos(db: Session = Depends(get_db)):
    return db.query(models.Evento).all()



# ======================
# Endpoint: Crear inscripción
# ======================
@app.post("/inscripciones/", response_model=schemas.Inscripcion)
def crear_inscripcion(inscripcion: schemas.InscripcionCreate, db: Session = Depends(get_db)):
    # Verificar si ya existe el mismo correo para el mismo evento
    existente = db.query(models.Inscripcion).filter(
        models.Inscripcion.correo == inscripcion.correo,
        models.Inscripcion.evento_id == inscripcion.evento_id
    ).first()

    if existente:
        raise HTTPException(status_code=400, detail="Este correo ya está inscrito en este evento.")

    nueva_inscripcion = models.Inscripcion(
        nombre=inscripcion.nombre,
        correo=inscripcion.correo,
        evento_id=inscripcion.evento_id
    )
    db.add(nueva_inscripcion)
    db.commit()
    db.refresh(nueva_inscripcion)
    return nueva_inscripcion


# ======================
# Endpoint: Listar inscripciones
# ======================
@app.get("/inscripciones/", response_model=list[schemas.Inscripcion])
def listar_inscripciones(db: Session = Depends(get_db)):
    return db.query(models.Inscripcion).all()
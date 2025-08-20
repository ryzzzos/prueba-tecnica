from fastapi import APIRouter, Depends, Form, File, UploadFile, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from datetime import datetime
import os

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

router = APIRouter()

# -------- CREAR EVENTO --------
@router.post("/crear", response_model=schemas.Evento)
def crear_evento(
    titulo: str = Form(...),
    descripcion: str = Form(...),
    fecha_hora: datetime = Form(...),
    lugar: str = Form(...),
    imagen: UploadFile = File(None),
    db: Session = Depends(get_db)
    ):
    ruta_imagen = None

    if imagen:
        if not imagen.filename.lower().endswith((".jpg", ".jpeg", ".png")):
            raise HTTPException(status_code=400, detail="Formato de imagen no válido")

        ruta_imagen = os.path.join(UPLOAD_DIR, imagen.filename)
        with open(ruta_imagen, "wb") as buffer:
            buffer.write(imagen.file.read())

    nuevo_evento = models.Evento(
        titulo=titulo,
        descripcion=descripcion,
        fecha_hora=fecha_hora,
        lugar=lugar,
        imagen=ruta_imagen
    )
    db.add(nuevo_evento)
    db.commit()
    db.refresh(nuevo_evento)
    return nuevo_evento


# -------- LISTAR EVENTOS --------
@router.get("/", response_model=list[schemas.Evento])
def listar_eventos(db: Session = Depends(get_db)):
    return db.query(models.Evento).all()


# -------- CREAR INSCRIPCION --------
@router.post("/asistencias", response_model=schemas.Inscripcion)
def inscribir(data: schemas.InscripcionCreate, db: Session = Depends(get_db)):
    evento = db.query(models.Evento).filter(models.Evento.id == data.evento_id).first()
    if not evento:
        raise HTTPException(status_code=404, detail="Evento no encontrado")

    inscripcion = models.Inscripcion(
        nombre=data.nombre,
        correo=data.correo,
        evento_id=data.evento_id
    )
    db.add(inscripcion)
    db.commit()
    db.refresh(inscripcion)
    return inscripcion


# -------- LISTAR INSCRIPCIONES POR EVENTO --------
@router.get("/asistencias", response_model=list[schemas.Inscripcion])
def listar_asistencias(eventoId: int = Query(...), db: Session = Depends(get_db)):
    return db.query(models.Inscripcion).filter(models.Inscripcion.evento_id == eventoId).all()

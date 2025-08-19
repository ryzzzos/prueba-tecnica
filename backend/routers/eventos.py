from fastapi import APIRouter, Depends, Form, File, UploadFile, HTTPException
from database import get_db
from sqlalchemy.orm import Session
import models, schemas
from datetime import datetime
import os

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

router = APIRouter()

#Aqui obtengo todos los eventos de la base de datos
@router.get("/", response_model=list[schemas.Evento])
def listar_eventos(db: Session = Depends(get_db)):
    return db.query(models.Evento).all()

#aqui creo un nuevo evento en la base de datos
@router.post("/crear", response_model=schemas.Evento)
def crear_evento(titulo: str = Form(...),
                 descripcion: str = Form(...),
                fecha_hora: datetime = Form(...),
                lugar: str = Form(...),
                imagen: UploadFile = File(None),
                db: Session = Depends(get_db)):
    # validaciones de la imagen
    if imagen and not imagen.filename.lower().endswith(('.png', '.jpg', '.jpeg')):
        raise HTTPException(status_code=400, detail="Formato de imagen no válido. Use PNG o JPG.")
    
    ruta_imagen = None
    
    if imagen:
        if not imagen.filename.lower().endswith((".jpg", ".jpeg", ".png")):
            raise HTTPException(status_code=400, detail="Formato de imagen no válido")

        ruta_imagen = os.path.join(UPLOAD_DIR, imagen.filename)

        # ✅ aseguramos que el directorio exista
        os.makedirs(UPLOAD_DIR, exist_ok=True)

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
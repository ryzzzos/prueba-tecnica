from fastapi import APIRouter, Depends
from database import get_db
from sqlalchemy.orm import Session
import models, schemas

router = APIRouter()

#Aqui obtengo todos los eventos de la base de datos
@router.get("/", response_model=list[schemas.Evento])
def listar_eventos(db: Session = Depends(get_db)):
    return db.query(models.Evento).all()

#aqui creo un nuevo evento en la base de datos
@router.post("/crear", response_model=schemas.Evento)
def crear_evento(evento: schemas.EventoCreate, db: Session = Depends(get_db)):
    nuevo_evento = models.Evento(**evento.dict())
    db.add(nuevo_evento)
    db.commit()
    db.refresh(nuevo_evento)
    return nuevo_evento
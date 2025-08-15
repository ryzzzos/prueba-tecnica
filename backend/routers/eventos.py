from fastapi import APIRouter, Depends
from database import get_db
from sqlalchemy.orm import Session
import models, schemas

router = APIRouter()

#Aqui obtengo todos los eventos de la base de datos
@router.get("/", response_model=list[schemas.Evento])
def listar_eventos(db: Session = Depends(get_db)):
    return db.query(models.Evento).all()



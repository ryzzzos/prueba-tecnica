from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

# -------- INSCRIPCION --------
class InscripcionBase(BaseModel):
    nombre: str
    correo: str

class InscripcionCreate(InscripcionBase):
    evento_id: int

class Inscripcion(InscripcionBase):
    id: int
    evento_id: int

    class Config:
        orm_mode = True


# -------- EVENTO --------
class EventoBase(BaseModel):
    titulo: str
    descripcion: str
    fecha_hora: datetime
    lugar: str
    imagen: Optional[str] = None

class EventoCreate(EventoBase):
    pass

class Evento(EventoBase):
    id: int
    inscripciones: List[Inscripcion] = []

    class Config:
        orm_mode = True

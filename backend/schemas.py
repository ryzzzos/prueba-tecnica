from pydantic import BaseModel
from datetime import datetime
from typing import List

# ==============================
# Evento
# ==============================
class EventoBase(BaseModel):
    titulo: str
    descripcion: str
    fecha_hora: datetime
    lugar: str

class EventoCreate(EventoBase):
    pass  

class Evento(EventoBase):
    id: int

    class Config:
        orm_mode = True 

# ==============================
# Inscripción
# ==============================
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

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Evento(Base):
    __tablename__ = "eventos"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String, nullable=False)
    descripcion = Column(String, nullable=False)
    fecha_hora = Column(DateTime, nullable=False)
    lugar = Column(String, nullable=False)
    imagen = Column(String, nullable=True)

    # relación con inscripciones
    inscripciones = relationship("Inscripcion", back_populates="evento", cascade="all, delete-orphan")


class Inscripcion(Base):
    __tablename__ = "inscripciones"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    correo = Column(String, nullable=False)
    evento_id = Column(Integer, ForeignKey("eventos.id"), nullable=False)

    evento = relationship("Evento", back_populates="inscripciones")

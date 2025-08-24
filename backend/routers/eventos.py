from fastapi import APIRouter, Depends, Form, File, UploadFile, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from datetime import datetime
from sqlalchemy import asc
import os
import time
import secrets
import re

# Config
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)  # Crea carpeta de uploads si no existe

ALLOWED_IMAGE_EXT = (".jpg", ".jpeg", ".png")
MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5 MB

router = APIRouter()


def _validate_text_field(name: str, value: str, max_len: int = 100):
    if value is None:
        raise HTTPException(status_code=400, detail=f"{name} es requerido")
    v = value.strip()
    if not v:
        raise HTTPException(status_code=400, detail=f"{name} no puede estar vacío")
    if len(v) > max_len:
        raise HTTPException(status_code=400, detail=f"{name} no puede exceder {max_len} caracteres")
    return v


def _is_valid_email(email: str) -> bool:
    # Validación sencilla pero práctica
    if not email:
        return False
    email = email.strip()
    pattern = r"^[\w\.-]+@[\w\.-]+\.\w+$"
    return re.match(pattern, email) is not None


def _secure_filename(orig: str) -> str:
    # basename + safe unique prefix
    base = os.path.basename(orig or "")
    _, ext = os.path.splitext(base)
    ext = ext.lower()
    # eliminar caracteres raros en base (solo dejar alfanumérico, guiones, subrayado y puntos)
    name = re.sub(r"[^A-Za-z0-9._-]", "", base) or "file"
    unique = f"{int(time.time())}_{secrets.token_hex(6)}"
    return f"{unique}{ext}"


# -------- CREAR EVENTO --------
@router.post("/crear", response_model=schemas.Evento)
def crear_evento(
    titulo: str = Form(...),
    descripcion: str = Form(...),
    fecha_hora: datetime = Form(...),
    lugar: str = Form(...),
    imagen: UploadFile = File(None),
    db: Session = Depends(get_db),
):
    # Validar textos
    titulo_clean = _validate_text_field("Título", titulo, max_len=200)
    descripcion_clean = _validate_text_field("Descripción", descripcion, max_len=4000)
    lugar_clean = _validate_text_field("Lugar", lugar, max_len=200)


    # Validar fecha futura
    ahora = datetime.now()
    if fecha_hora <= ahora:
        raise HTTPException(
            status_code=400,
            detail="La fecha del evento debe ser mayor a la fecha actual"
        )


    ruta_imagen = None
    # Validar imagen y guardarla en disco (si se proporciona)
    if imagen:
        # content_type check
        ct = (imagen.content_type or "").lower()
        if not ct.startswith("image/"):
            raise HTTPException(status_code=400, detail="El archivo no parece una imagen válida")

        filename = os.path.basename(imagen.filename or "")
        _, ext = os.path.splitext(filename)
        ext = ext.lower()
        if ext not in ALLOWED_IMAGE_EXT:
            raise HTTPException(status_code=400, detail="Formato de imagen no válido. Use PNG o JPG.")
        
        # crear filename seguro y ruta
        safe_name = _secure_filename(filename)
        ruta_imagen = os.path.join(UPLOAD_DIR, safe_name)

        # Guardado por chunks y control de tamaño
        try:
            total = 0
            with open(ruta_imagen, "wb") as buffer:
                while True:
                    chunk = imagen.file.read(1024 * 1024)  # 1MB
                    if not chunk:
                        break
                    total += len(chunk)
                    if total > MAX_IMAGE_SIZE:
                        # borrar archivo parcial
                        buffer.close()
                        try:
                            os.remove(ruta_imagen)
                        except Exception:
                            pass
                        raise HTTPException(status_code=400, detail="Imagen demasiado grande (máx 5 MB).")
                    buffer.write(chunk)
            # al terminar, posicionar el file para garantizar que no quede consumed (no estrictamente necesario)
            try:
                imagen.file.seek(0)
            except Exception:
                pass
        except HTTPException:
            raise
        except Exception as e:
            # en caso de error al escribir
            try:
                if os.path.exists(ruta_imagen):
                    os.remove(ruta_imagen)
            except Exception:
                pass
            raise HTTPException(status_code=500, detail="Error guardando la imagen en el servidor")

    # Crear registro en BD con manejo seguro de transacción
    nuevo_evento = models.Evento(
        titulo=titulo_clean,
        descripcion=descripcion_clean,
        fecha_hora=fecha_hora,
        lugar=lugar_clean,
        imagen=ruta_imagen
    )
    try:
        db.add(nuevo_evento)
        db.commit()
        db.refresh(nuevo_evento)
    except Exception as e:
        db.rollback()
        # si se creó archivo de imagen y la BD falla, intentamos limpiar el archivo
        if ruta_imagen and os.path.exists(ruta_imagen):
            try:
                os.remove(ruta_imagen)
            except Exception:
                pass
        raise HTTPException(status_code=500, detail="Error guardando el evento en la base de datos")
    return nuevo_evento


# -------- LISTAR EVENTOS FUTUROS --------
@router.get("/", response_model=list[schemas.Evento])
def listar_eventos(db: Session = Depends(get_db)):
    ahora = datetime.now()
    # Retorna eventos cuya fecha es mayor o igual a hoy, ordenados por fecha
    return (
        db.query(models.Evento)
        .filter(models.Evento.fecha_hora >= ahora)
        .order_by(asc(models.Evento.fecha_hora))
        .all()
    )


# -------- INSCRIBIR A UN EVENTO --------
@router.post("/asistencias", response_model=schemas.Inscripcion)
def inscribir(data: schemas.InscripcionCreate, db: Session = Depends(get_db)):
    # Validar payload mínimo
    if data is None:
        raise HTTPException(status_code=400, detail="Datos de inscripción inválidos")

    nombre = (data.nombre or "").strip()
    correo = (data.correo or "").strip().lower()

    if not nombre:
        raise HTTPException(status_code=400, detail="El nombre es obligatorio")
    if len(nombre) > 150:
        raise HTTPException(status_code=400, detail="El nombre es demasiado largo")

    if not correo or not _is_valid_email(correo):
        raise HTTPException(status_code=400, detail="Correo electrónico inválido")

    # Verificar que el evento exista
    evento = db.query(models.Evento).filter(models.Evento.id == data.evento_id).first()
    if not evento:
        raise HTTPException(status_code=404, detail="Evento no encontrado")

    # Evitar duplicados (mismo correo en el mismo evento) - email comparado en minúscula
    duplicado = (
        db.query(models.Inscripcion)
        .filter(
            models.Inscripcion.evento_id == data.evento_id,
            models.Inscripcion.correo.ilike(correo)  # ilike para seguridad con mayúsc/minúsc
        )
        .first()
    )
    if duplicado:
        raise HTTPException(status_code=400, detail="Ya estás inscrito en este evento con ese correo")

    # Crear nueva inscripción
    inscripcion = models.Inscripcion(
        nombre=nombre,
        correo=correo,
        evento_id=data.evento_id
    )
    try:
        db.add(inscripcion)
        db.commit()
        db.refresh(inscripcion)
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error guardando la inscripción en la base de datos")

    return inscripcion


# -------- LISTAR INSCRIPCIONES POR EVENTO --------
@router.get("/asistencias", response_model=list[schemas.Inscripcion])
def listar_asistencias(eventoId: int = Query(...), db: Session = Depends(get_db)):
    # Devuelve todos los inscritos en un evento específico
    return db.query(models.Inscripcion).filter(models.Inscripcion.evento_id == eventoId).all()

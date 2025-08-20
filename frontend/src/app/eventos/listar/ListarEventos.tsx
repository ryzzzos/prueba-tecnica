"use client"

import { useEffect, useState } from "react"
import styles from "./ListarEventos.module.css"

interface Evento {
  id: number
  titulo: string
  descripcion: string
  fecha_hora: string
  lugar: string
  imagen: string
}

interface Asistente {
  id: number
  nombre: string
  correo: string
  evento_id: number
}

export default function ListarEventos() {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [formActivo, setFormActivo] = useState(false)
  const [nombre, setNombre] = useState("")
  const [correo, setCorreo] = useState("")
  const [asistentes, setAsistentes] = useState<Asistente[]>([])

  // -------- GET EVENTOS (una sola vez al cargar) --------
  useEffect(() => {
    fetch("http://localhost:8000/eventos")
      .then((res) => res.json())
      .then((data) => setEventos(Array.isArray(data) ? data : []))
      .catch(() => setEventos([]))
  }, [])

  // -------- GET ASISTENTES (cuando cambia de evento) --------
  useEffect(() => {
    if (!eventos[activeIndex]) return

    fetch(`http://localhost:8000/eventos/asistencias?eventoId=${eventos[activeIndex].id}`)
      .then((res) => res.json())
      .then((data) => setAsistentes(Array.isArray(data) ? data : []))
      .catch(() => setAsistentes([]))
  }, [activeIndex, eventos])

  // -------- POST INSCRIPCIÓN --------
  const handleSubmit = async () => {
    if (!nombre || !correo) return alert("Por favor completa todos los campos")

    const body = {
      evento_id: eventos[activeIndex].id,
      nombre,
      correo,
    }

    try {
      const res = await fetch("http://localhost:8000/eventos/asistencias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) throw new Error("Error al guardar asistencia")

      const nuevo = await res.json()
      setAsistentes((prev) => [...prev, nuevo])
      setFormActivo(false)
      setNombre("")
      setCorreo("")
    } catch (err) {
      console.error(err)
      alert("Hubo un problema registrando la asistencia")
    }
  }

  // -------- Cambiar evento --------
  const next = () => {
    setFormActivo(false)
    setActiveIndex((prev) => (prev < eventos.length - 1 ? prev + 1 : prev))
  }

  const prev = () => {
    setFormActivo(false)
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev))
  }

  return (
    <div className={styles.wrapper}>
      {/* Flecha izquierda */}
      <button className={styles.arrowLeft} onClick={prev}>
        <span className="material-symbols-outlined">arrow_back_ios</span>
      </button>

      <div className={styles.viewer}>
        {eventos.length > 0 && (
          <div key={eventos[activeIndex].id} className={styles.card}>
            <img
              src={
                eventos[activeIndex].imagen
                  ? `http://localhost:8000/${eventos[activeIndex].imagen.replace(/\\/g, "/")}`
                  : "/placeholder.png"
              }
              alt={eventos[activeIndex].titulo}
              className={styles.image}
            />

            {/* Información */}
            <div className={`${styles.informacion} ${formActivo ? styles.expandida : ""}`}>
              {formActivo && (
                <span
                  className={`material-symbols-outlined ${styles.closeBtn}`}
                  onClick={() => setFormActivo(false)}
                >
                  close
                </span>
              )}

              <h3>{eventos[activeIndex].titulo}</h3>

              <div className={styles.contgrupito}>
                <div className={styles.grupito}>
                  <span className="material-symbols-outlined">location_on</span>
                  <p>{eventos[activeIndex].lugar}</p>
                </div>
                <div className={styles.grupito}>
                  <span className="material-symbols-outlined">calendar_today</span>
                  <span>{new Date(eventos[activeIndex].fecha_hora).toLocaleDateString()}</span>
                </div>
                <div className={styles.grupito}>
                  <span className="material-symbols-outlined">access_time</span>
                  <span>
                    {new Date(eventos[activeIndex].fecha_hora).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              <hr className={styles.divider} />

              <div className={styles.footerCard}>
                {/* avatares dinámicos */}
                <div className={styles.avatars}>
                  {asistentes.slice(0, 3).map((a) => (
                    <div key={a.id} className={styles.avatar}>
                      {a.nombre[0].toUpperCase()}
                    </div>
                  ))}
                  {asistentes.length > 3 && (
                    <span className={styles.more}>+{asistentes.length - 3}</span>
                  )}
                </div>
                <button className={styles.joinBtn} onClick={() => setFormActivo(true)}>
                  Ir
                </button>
              </div>

              {/* Formulario */}
              <div className={`${styles.extraCampos} ${formActivo ? styles.showCampos : ""}`}>
                <p >{eventos[activeIndex].descripcion}</p>
                <input
                  type="text"
                  placeholder="Nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
                <input
                  type="email"
                  placeholder="Correo electrónico"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  required
                />
                <button className={styles.joinBtn} onClick={handleSubmit}>
                  Confirmar asistencia
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Flecha derecha */}
      <button className={styles.arrowRight} onClick={next}>
        <span className="material-symbols-outlined">arrow_forward_ios</span>
      </button>

      {/* Selector tipo historias */}
      <div className={styles.progress}>
        {eventos.map((_, i) => (
          <div
            key={i}
            className={`${styles.dot} ${i === activeIndex ? styles.activeDot : ""}`}
          />
        ))}
      </div>
    </div>
  )
}

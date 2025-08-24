"use client"

import { useEffect, useState } from "react"
import styles from "./ListarEventos.module.css"
import { useToast } from "../../components/ToastContext.tsx";

/* Tipos de datos del dominio */
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
  const { addToast } = useToast();

  /* Estado local del componente */
  const [eventos, setEventos] = useState<Evento[]>([])
  const [activeIndex, setActiveIndex] = useState(0)          // índice del evento visible
  const [formActivo, setFormActivo] = useState(false)        // controla el slide del formulario
  const [listaActiva, setListaActiva] = useState(false)      // controla el slide de la lista de asistentes
  const [nombre, setNombre] = useState("")
  const [correo, setCorreo] = useState("")
  const [asistentes, setAsistentes] = useState<Asistente[]>([])
  
  /* GET eventos: se ejecuta una sola vez al montar */
  useEffect(() => {
    fetch("http://localhost:8000/eventos")
      .then((res) => res.json())
      .then((data) => setEventos(Array.isArray(data) ? data : []))
      .catch(() => setEventos([]))
  }, [])

  /* GET asistentes: se ejecuta cuando cambia el evento activo */
  useEffect(() => {
    if (!eventos[activeIndex]) return

    fetch(`http://localhost:8000/eventos/asistencias?eventoId=${eventos[activeIndex].id}`)
      .then((res) => res.json())
      .then((data) => setAsistentes(Array.isArray(data) ? data : []))
      .catch(() => setAsistentes([]))
  }, [activeIndex, eventos])

  /* POST inscripción del usuario al evento actual */
  const handleSubmit = async () => {
    if (!nombre || !correo) return addToast("warning", "Por favor completa todos los campos")

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

      // Si el backend responde error, propaga el detalle para el toast
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.detail || "Error al inscribirse") 
      }

      // Éxito: agrega el nuevo asistente y resetea el formulario de inscripción
      const nuevo = await res.json()
      setAsistentes((prev) => [...prev, nuevo])
      setFormActivo(false)
      setNombre("")
      setCorreo("")
      addToast("success", "¡Inscripción confirmada!")
    } catch (err: any) {
      console.error(err)
      addToast("error", err.message) 
    }
  }

  /* Navegación entre tarjetas de eventos */
  const next = () => {
    setFormActivo(false)
    setActiveIndex((prev) => (prev < eventos.length - 1 ? prev + 1 : prev))
  }

  const prev = () => {
    setFormActivo(false)
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev))
  }

  /* Render principal: carrusel + info + formulario + lista de asistentes */
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

            {/* Panel inferior con datos + acciones (se expande/colapsa) */}
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

              {/* Metadatos del evento */}
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
                {/* Avatares: al hacer click, alterna la lista de asistentes */}
                <div
                  className={styles.avatars}
                  onClick={() => setListaActiva((prev) => !prev)} 
                >
                  {asistentes.slice(0, 3).map((a) => (
                    <div key={a.id} className={styles.avatar}>
                      <img src={`https://robohash.org/${a.id}`} alt="" />
                    </div>
                  ))}
                  {asistentes.length > 3 && (
                    <span className={styles.more}>+{asistentes.length - 3}</span>
                  )}
                </div>
                
                {/* Abre el slide del formulario */}
                <button className={styles.joinBtn} onClick={() => setFormActivo(true)}>
                  Ir
                </button>
              </div>

              {/* Formulario de inscripción (slide) */}
              <div className={`${styles.extraCampos} ${formActivo ? styles.showCampos : ""}`}>
                <p>{eventos[activeIndex].descripcion}</p>
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

              {/* Lista de asistentes (slide con scroll interno) */}
              <div className={`${styles.extraCampos} ${listaActiva ? styles.showCampos : ""}`}>
                <div className={styles.asistentesScroll}>
                  <table>
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Correo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {asistentes.map((a) => (
                        <tr key={a.id}>
                          <td>{a.nombre}</td>
                          <td>{a.correo}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Flecha derecha */}
      <button className={styles.arrowRight} onClick={next}>
        <span className="material-symbols-outlined">arrow_forward_ios</span>
      </button>

      {/* Indicadores inferiores del carrusel */}
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

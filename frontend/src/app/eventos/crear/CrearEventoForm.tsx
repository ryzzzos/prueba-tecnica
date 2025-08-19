"use client";
import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import styles from "./CrearEventoForm.module.css";
import Boton3D from "../../components/Boton3D";

interface EventoFormData {
  titulo: string;
  descripcion: string;
  fecha_hora: string;
  lugar: string;
  imagen?: File;
}

interface CrearEventoFormProps {
  onSubmit: (data: EventoFormData) => void;
}

export default function CrearEventoForm({ onSubmit }: CrearEventoFormProps) {
  const [formData, setFormData] = useState<EventoFormData>({
    titulo: "",
    descripcion: "",
    fecha_hora: "",
    lugar: "",
  });

  const [preview, setPreview] = useState<string | null>(null);

  // Limpia la URL anterior para evitar fugas de memoria
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (preview) URL.revokeObjectURL(preview);
      const url = URL.createObjectURL(file);
      setPreview(url);
      setFormData({ ...formData, imagen: file });
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <aside className={styles.asideLeft}>
        <h1>Crear Evento</h1>

        <div>
          <label>Título</label>
          <input
            type="text"
            name="titulo"
            value={formData.titulo}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Descripción</label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Fecha y Hora</label>
          <input
            type="datetime-local"
            name="fecha_hora"
            value={formData.fecha_hora}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Lugar</label>
          <input
            type="text"
            name="lugar"
            value={formData.lugar}
            onChange={handleChange}
            required
          />
        </div>

        <Boton3D text="Crear Evento" type="submit" />
      </aside>

      <aside className={`${styles.asideRight} ${preview ? styles.imageLoaded : ""}`}>
        {!preview && (
          <label className={styles.uploadLabel}>
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageChange}
              required
            />
            <span className="material-symbols-outlined">add_photo_alternate</span>
          </label>
        )}

        {preview && <img src={preview} alt="Preview" className={styles.previewImage} />}
      </aside>
    </form>
  );
}

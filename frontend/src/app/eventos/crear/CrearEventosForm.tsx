"use client";
import { useState, ChangeEvent, FormEvent } from "react";
import styles from "./CrearEventoForm.module.css";
import Boton3D from "../../components/Boton3D";


// definir la forma de los datos del formulario
interface EventoFormData {
  titulo: string;
  descripcion: string;
  fecha: string;
  lugar: string;
}

interface CrearEventoFormProps {
  onSubmit: (data: EventoFormData) => void;
}


export default function CrearEventoForm({ onSubmit }: CrearEventoFormProps) {
  const [formData, setFormData] = useState<EventoFormData>({
    titulo: "",
    descripcion: "",
    fecha: "",
    lugar: ""
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(formData); 
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label>Título:</label>
      <input 
        type="text" 
        name="titulo" 
        value={formData.titulo} 
        onChange={handleChange} 
        required 
      />

      <label>Descripción:</label>
      <textarea 
        name="descripcion" 
        value={formData.descripcion} 
        onChange={handleChange} 
        required 
      />

      <label>Fecha y Hora:</label>
      <input 
        type="datetime-local" 
        name="fecha" 
        value={formData.fecha} 
        onChange={handleChange} 
        required 
      />

      <label>Lugar:</label>
      <input 
        type="text" 
        name="lugar" 
        value={formData.lugar} 
        onChange={handleChange} 
        required 
      />

      <Boton3D text="Crear Evento"  type="submit" />

    </form>
  );
}
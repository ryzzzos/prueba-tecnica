"use client";
import CrearEventoForm from "./CrearEventoForm";
import { useToast } from "../../components/ToastContext.tsx";

export default function CrearEventoPage() {
  const { addToast } = useToast();

  // Maneja la creación de un nuevo evento
  const handleCrearEvento = async (data: any) => {
    try {
      // Construir formData para enviar datos y archivos al backend
      const formData = new FormData();
      formData.append("titulo", data.titulo);
      formData.append("descripcion", data.descripcion);
      formData.append("fecha_hora", data.fecha_hora);
      formData.append("lugar", data.lugar);

      if (data.imagen) {
        formData.append("imagen", data.imagen); 
      }

      // Petición al backend
      const res = await fetch("http://127.0.0.1:8000/eventos/crear", {
        method: "POST",
        body: formData,
      });

      // Mostrar notificación según la respuesta
      if (res.ok) {
        addToast("success", "Evento creado correctamente");
      } else {
        const error = await res.json();
        addToast("error", error.detail);
      }
    } catch (error) {
      console.error(error);
      addToast("error", "Error con el servidor al crear el evento");
    }
  };

  // Renderiza el formulario de creación
  return (
    <div>
      <CrearEventoForm onSubmit={handleCrearEvento} />
    </div>
  );
}

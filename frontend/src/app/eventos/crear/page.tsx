"use client";
import CrearEventoForm from "./CrearEventoForm";
import { useToast } from "../../components/ToastContext.tsx";

export default function CrearEventoPage() {
  const { addToast } = useToast();
  const handleCrearEvento = async (data: any) => {
    try {
      const formData = new FormData();
      formData.append("titulo", data.titulo);
      formData.append("descripcion", data.descripcion);
      formData.append("fecha_hora", data.fecha_hora);
      formData.append("lugar", data.lugar);

      if (data.imagen) {
        formData.append("imagen", data.imagen); 
      }

      const res = await fetch("http://127.0.0.1:8000/eventos/crear", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
          addToast("success", "Evento creado correctamente 🎉");

      } else {
        const error = await res.json();
        addToast("error",  "Error: " + error.detail);

      }
    } catch (error) {
      console.error(error);
      addToast("error", "Error con el servidor al crear el evento");
    }
  };

  return (
    <div>
      <CrearEventoForm onSubmit={handleCrearEvento} />
    </div>
  );
}

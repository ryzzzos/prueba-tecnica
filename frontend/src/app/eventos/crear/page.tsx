"use client";
import CrearEventoForm from "./CrearEventosForm";


export default function CrearEventoPage() {
  const handleCrearEvento = async (data:any) => {
    try {
      const res = await fetch("http://127.0.0.1:8000/eventos/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        alert("Evento creado con éxito");
      } else {
        alert("Error al crear evento");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión con el servidor");
    }
  };

  return (
    <div>
      <h1>Crear Evento</h1>
      <CrearEventoForm onSubmit={handleCrearEvento} />
    </div>
  );
}

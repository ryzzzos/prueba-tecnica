'use client'
import { useToast } from "../components/ToastContext.tsx";

export default function TestToastPage() {
  const { addToast } = useToast();

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Prueba de Toasts 🚀</h1>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <button
          onClick={() => addToast("success", "Todo salió bien")}
          style={{ padding: "0.6rem 1rem", background: "#10C38F", color: "#fff", border: "none", borderRadius: "6px" }}
        >
          Success
        </button>
        <button
          onClick={() => addToast("error", "Hubo un error")}
          style={{ padding: "0.6rem 1rem", background: "#FF5E5E", color: "#fff", border: "none", borderRadius: "6px" }}
        >
          Error
        </button>
        <button
          onClick={() => addToast("info", "Solo para informar")}
          style={{ padding: "0.6rem 1rem", background: "#60A5FA", color: "#fff", border: "none", borderRadius: "6px" }}
        >
          Info
        </button>
        <button
          onClick={() => addToast("warning", "Advertencia importante")}
          style={{ padding: "0.6rem 1rem", background: "#f59e0b", color: "#fff", border: "none", borderRadius: "6px" }}
        >
          Warning
        </button>
      </div>
    </div>
  );
}

'use client'
import { createContext, useContext, useState, ReactNode } from "react";
import Style from "./ToastContex.module.css";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: number;
  type: ToastType;
  message: string;
  exiting?: boolean; 
}

interface ToastContextType {
  addToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Elimina un toast con animación de salida
  const removeToast = (id: number) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 400);
  };

  // Agrega un nuevo toast y lo elimina automáticamente a los 5 segundos
  const addToast = (type: ToastType, message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div id={Style["toast-container"]}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`${Style.toast} ${Style[`toast-${toast.type}`]} ${toast.exiting ? Style.exit : ""}`}
          >
            {/* Icono de acuerdo al tipo de toast */}
            <div className={`${Style["toast-icon-box"]} ${Style[`toast-${toast.type}`]}`}>
              <span className={`material-symbols-outlined ${Style.icon}`}>
                {toast.type === "success" && "check"}
                {toast.type === "error" && "close"}
                {toast.type === "info" && "info"}
                {toast.type === "warning" && "warning"}
              </span>
            </div>

            {/* Mensaje del toast */}
            <div className={Style["toast-message"]}>
              <strong>
                {toast.type === "success" && "¡Éxito!"}
                {toast.type === "error" && "Error"}
                {toast.type === "info" && "Información"}
                {toast.type === "warning" && "Advertencia"}
              </strong>
              <span>{toast.message}</span>
            </div>

            {/* Botón para cerrar manualmente */}
            <span
              className={`material-symbols-outlined ${Style.close}`}
              onClick={() => removeToast(toast.id)}
            >
              close
            </span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// Hook personalizado para acceder al contexto de toasts
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast debe usarse dentro de ToastProvider");
  return context;
}

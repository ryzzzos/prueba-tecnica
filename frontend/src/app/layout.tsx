import "./globals.css";
import Navbar from "./navbar/Navbar";
import { montserrat } from "./UI/fonts";
import { ToastProvider } from "./components/ToastContext.tsx";

export const metadata = {
  title: "Mi App",
  description: "Con sistema de notificaciones",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
    />
      </head>
      <body className={`${montserrat.className} antialiased`}>
        <ToastProvider>
          <Navbar />
          <main>{children}</main>
        </ToastProvider>
      </body>
    </html>
  );
}

import Link from "next/link";
import styles from "./Navbar.module.css"; 
import Image from "next/image";   
import logo from "./logo.png"

export default function Navbar() {
  return (
    // Barra de navegación principal
    <nav className={styles.navbar}>

      {/* Logo de la aplicación */}
      <Image 
      src={logo} 
      alt="Lynxus Logo"
      width={150}
      height={50} 
      style={{ objectFit: "contain" }} 
      />

      {/* Menú de navegación */}
      <ul className={styles.menu}>
        <li><Link href="/">Inicio</Link></li>
        <li><Link href="/eventos/listar">Eventos</Link></li>
        <li><Link href="/eventos/crear">Crear</Link></li>
      </ul>
    </nav>
  );
}
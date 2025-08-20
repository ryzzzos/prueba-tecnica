import Link from "next/link";
import styles from "./Navbar.module.css"; 
import Image from "next/image";   

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <Image src="https://lynxus.biz/uploads/general/logo-lynxus-alt-0.svg" alt="Lynxus Logo"
      width={120}
      height={60}
      />
      <ul className={styles.menu}>
        <li><Link href="/">Inicio</Link></li>
        <li><Link href="/eventos/listar">Eventos</Link></li>
        <li><Link href="/eventos/crear">Crear</Link></li>
      </ul>
    </nav>
  );
}
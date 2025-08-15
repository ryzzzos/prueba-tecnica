import Link from "next/link";
import styles from "./Boton3D.module.css";

export default function Boton3D({ text }) {
return(
 <button className={styles.Boton3D}>
    {text}
 </button>
);}

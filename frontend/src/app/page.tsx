import Link from "next/link";
import Boton3D from "./components/Boton3D";
import Headline from "./components/Headline";

export default function Home() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center',  textAlign: 'center', flexDirection: 'column', maxWidth: '60%', margin: '100px auto 0 auto', }}>
      <Headline titulo="Gestor de eventos Lynxus" parrafo="La herramienta perfecta para organizar y gestionar tus eventos de manera eficiente y sencilla." />
      <Boton3D text="Comenzar"/>
    </div>
  );
}
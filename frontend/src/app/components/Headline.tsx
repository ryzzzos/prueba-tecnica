import Style from "./Headline.module.css";

export default function Headline({titulo, parrafo}) {
  return (
    <div className={Style.headline}>
        <h1 className="h1">
          {titulo} 
        </h1>
        <h3>
          {parrafo}
        </h3>
    </div>

  );
}
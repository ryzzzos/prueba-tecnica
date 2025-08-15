import './globals.css';
import Navbar from './components/navbar/Navbar';
import { montserrat } from './UI/fonts';

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${montserrat.className} antialeased`}>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}

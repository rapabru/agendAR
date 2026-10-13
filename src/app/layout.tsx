import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgendAR - Espacio de Trabajo con Notas, Bases de Datos y Google Calendar",
  description:
    "Clon avanzado de Notion con encriptación de extremo a extremo, inicio de sesión seguro y sincronización nativa con Google Calendar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className="antialiased bg-[#191919] text-[#e3e2e0]">
        {children}
      </body>
    </html>
  );
}

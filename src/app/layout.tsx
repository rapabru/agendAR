import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AgendAR - Espacio de Trabajo Inteligente, Notas y Google Calendar",
  description:
    "El espacio de trabajo colaborativo todo-en-uno con notas estructuradas, bases de datos, bóvedas cifradas E2EE y sincronización con Google Calendar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`dark ${plusJakarta.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased font-sans bg-[#0c0d12] text-[#e2e4e9] selection:bg-blue-500/30 selection:text-blue-200">
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "El Arca Market — Gestión Inteligente & Punto de Venta",
  description:
    "Sistema integral de gestión de inventario, punto de venta, control de caja e Inteligencia Artificial determinista para El Arca Market.",
  keywords: ["punto de venta", "pos", "inventario", "el arca market", "gemini ai", "caja diario"],
  authors: [{ name: "El Arca Market Team" }],
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-slate-950 text-slate-100 min-h-screen selection:bg-emerald-500 selection:text-white`}>
        {children}
      </body>
    </html>
  );
}

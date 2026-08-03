"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Store,
  Bot,
  ShoppingCart,
  LayoutDashboard,
  Package,
  Landmark,
  BarChart3,
  Receipt,
  Boxes,
  Settings,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { clsx } from "clsx";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { isDark, toggleTheme } = useTheme();

  const navigationItems = [
    { name: "Panel Principal", href: "/dashboard", icon: LayoutDashboard },
    { name: "Punto de Venta (POS)", href: "/pos", icon: ShoppingCart },
    { name: "Asistente IA", href: "/ai-assistant", icon: Bot },
    { name: "Catálogo Productos", href: "/products", icon: Package },
    { name: "Inventario & Kardex", href: "/inventory", icon: Boxes },
    { name: "Caja & Cuadre", href: "/cash", icon: Landmark },
    { name: "Gastos", href: "/expenses", icon: Receipt },
    { name: "Reportes", href: "/reports", icon: BarChart3 },
    { name: "Configuración", href: "/settings", icon: Settings },
  ];

  return (
    <header
      className={clsx(
        "border-b sticky top-0 z-40 px-4 py-3 flex items-center justify-between md:justify-end",
        "bg-[hsl(var(--app-surface))] border-[hsl(var(--app-border))]",
        "transition-colors duration-200"
      )}
    >
      {/* Mobile Brand Header */}
      <div className="flex items-center gap-3 md:hidden">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={clsx(
            "p-2 rounded-lg border transition-colors",
            "text-[hsl(var(--app-text-muted))] hover:text-[hsl(var(--app-text))]",
            "bg-[hsl(var(--app-surface-2))] border-[hsl(var(--app-border))]"
          )}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-slate-950 text-sm">
            <Store className="w-4 h-4" />
          </div>
          <span className="font-bold text-[hsl(var(--app-text))] text-base">El Arca Market</span>
        </div>
      </div>

      {/* Action Badges Header */}
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-500 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          Caja Abierta
        </div>

        <Link
          href="/ai-assistant"
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-slate-950 font-bold text-xs shadow-md hover:opacity-90 transition-opacity"
        >
          <Bot className="w-4 h-4" />
          <span>Consultar IA</span>
        </Link>

        {/* ── Toggle Tema Claro / Oscuro ── */}
        <button
          onClick={toggleTheme}
          title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          className={clsx(
            "p-2 rounded-xl border transition-all duration-200",
            "text-[hsl(var(--app-text-muted))] hover:text-[hsl(var(--app-text))]",
            "bg-[hsl(var(--app-surface-2))] border-[hsl(var(--app-border))]",
            "hover:bg-[hsl(var(--app-hover))]"
          )}
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-500" />
          )}
        </button>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div
          className={clsx(
            "fixed inset-0 top-[57px] z-50 p-4 overflow-y-auto md:hidden border-t backdrop-blur-lg",
            "bg-[hsl(var(--app-bg))]/95 border-[hsl(var(--app-border))]"
          )}
        >
          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={clsx(
                    "flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-base transition-colors",
                    isActive
                      ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/25"
                      : "text-[hsl(var(--app-text-muted))] hover:bg-[hsl(var(--app-hover))] hover:text-[hsl(var(--app-text))]"
                  )}
                >
                  <Icon className="w-5 h-5 text-emerald-500" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}

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
} from "lucide-react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

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
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 px-4 py-3 flex items-center justify-between md:justify-end">
      {/* Mobile Brand Header */}
      <div className="flex items-center gap-3 md:hidden">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-300 hover:text-white rounded-lg bg-slate-800 border border-slate-700"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-slate-950 text-sm">
            <Store className="w-4 h-4" />
          </div>
          <span className="font-bold text-white text-base">El Arca Market</span>
        </div>
      </div>

      {/* Action Badges Header */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          Caja Abierta
        </div>

        <Link
          href="/ai-assistant"
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-slate-950 font-bold text-xs shadow-md shadow-emerald-900/20 hover:opacity-90 transition-opacity"
        >
          <Bot className="w-4 h-4" />
          <span>Consultar IA</span>
        </Link>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-[57px] bg-slate-950/95 backdrop-blur-lg z-50 p-4 overflow-y-auto md:hidden border-t border-slate-800">
          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-base ${
                    isActive
                      ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30"
                      : "text-slate-300 hover:bg-slate-900"
                  }`}
                >
                  <Icon className="w-5 h-5 text-emerald-400" />
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

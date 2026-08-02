"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Boxes,
  Landmark,
  Bot,
  Receipt,
  BarChart3,
  Settings,
  LogOut,
  Store,
  Sparkles,
} from "lucide-react";
import { clsx } from "clsx";

const navigationItems = [
  { name: "Panel Principal", href: "/dashboard", icon: LayoutDashboard },
  { name: "Punto de Venta (POS)", href: "/pos", icon: ShoppingCart, highlight: true },
  { name: "Asistente IA", href: "/ai-assistant", icon: Bot, badge: "IA", aiGlow: true },
  { name: "Catálogo Productos", href: "/products", icon: Package },
  { name: "Inventario & Kardex", href: "/inventory", icon: Boxes },
  { name: "Caja & Cuadre", href: "/cash", icon: Landmark },
  { name: "Gastos Operativos", href: "/expenses", icon: Receipt },
  { name: "Reportes & Analítica", href: "/reports", icon: BarChart3 },
  { name: "Configuración", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("arca_token");
    localStorage.removeItem("arca_user");
    router.push("/login");
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0 z-30 select-none hidden md:flex">
      {/* Brand Logo Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-900/30 text-slate-950 font-bold text-xl">
          <Store className="w-6 h-6 text-slate-950 stroke-[2.5]" />
        </div>
        <div>
          <h1 className="font-extrabold text-lg tracking-tight text-white leading-tight flex items-center gap-1.5">
            El Arca
            <span className="text-emerald-400 text-xs px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 font-semibold">
              POS
            </span>
          </h1>
          <p className="text-xs text-slate-400">Gestión Inteligente</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative",
                isActive
                  ? "bg-emerald-600/15 text-emerald-400 border border-emerald-500/30 font-semibold shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/70"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={clsx(
                    "w-5 h-5 transition-transform duration-200 group-hover:scale-110",
                    isActive
                      ? "text-emerald-400"
                      : item.aiGlow
                      ? "text-teal-400 animate-pulse-subtle"
                      : "text-slate-400 group-hover:text-slate-200"
                  )}
                />
                <span>{item.name}</span>
              </div>

              {item.badge && (
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-sm flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer User Info & Logout */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-emerald-400">
              EA
            </div>
            <div className="text-xs">
              <p className="font-semibold text-slate-200">El Arca Market</p>
              <p className="text-slate-400 capitalize">Administrador</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Cerrar Sesión"
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

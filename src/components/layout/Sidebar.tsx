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
    <aside
      className={clsx(
        "w-64 flex flex-col h-screen sticky top-0 z-30 select-none hidden md:flex",
        "bg-[hsl(var(--app-surface))] border-r border-[hsl(var(--app-border))]",
        "transition-colors duration-200"
      )}
    >
      {/* Brand Logo Header */}
      <div className="p-5 border-b border-[hsl(var(--app-border-soft))] flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-900/20 text-slate-950 font-bold text-xl">
          <Store className="w-6 h-6 text-slate-950 stroke-[2.5]" />
        </div>
        <div>
          <h1 className="font-extrabold text-lg tracking-tight text-[hsl(var(--app-text))] leading-tight flex items-center gap-1.5">
            El Arca
            <span className="text-emerald-500 text-xs px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 font-semibold">
              POS
            </span>
          </h1>
          <p className="text-xs text-[hsl(var(--app-text-muted))]">Gestión Inteligente</p>
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
                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 font-semibold shadow-sm"
                  : "text-[hsl(var(--app-text-muted))] hover:text-[hsl(var(--app-text))] hover:bg-[hsl(var(--app-hover))]"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={clsx(
                    "w-5 h-5 transition-transform duration-200 group-hover:scale-110",
                    isActive
                      ? "text-emerald-500"
                      : item.aiGlow
                      ? "text-teal-500 animate-pulse-subtle"
                      : "text-[hsl(var(--app-text-dim))] group-hover:text-[hsl(var(--app-text-muted))]"
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
      <div className="p-4 border-t border-[hsl(var(--app-border-soft))] bg-[hsl(var(--app-surface))]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[hsl(var(--app-surface-2))] border border-[hsl(var(--app-border))] flex items-center justify-center text-xs font-bold text-emerald-500">
              EA
            </div>
            <div className="text-xs">
              <p className="font-semibold text-[hsl(var(--app-text))]">El Arca Market</p>
              <p className="text-[hsl(var(--app-text-muted))] capitalize">Administrador</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Cerrar Sesión"
            className="p-2 text-[hsl(var(--app-text-muted))] hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

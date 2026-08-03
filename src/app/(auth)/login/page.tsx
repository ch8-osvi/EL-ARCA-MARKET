"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Store, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";

export default function LoginPage() {
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();
  const [email, setEmail] = useState("admin@elarcamarket.com");
  const [password, setPassword] = useState("Admin123!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al iniciar sesión.");
      }

      localStorage.setItem("arca_token", data.token);
      localStorage.setItem("arca_user", JSON.stringify(data.user));
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  const setPresetUser = (presetEmail: string, presetPass: string) => {
    setEmail(presetEmail);
    setPassword(presetPass);
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-200"
      style={{ backgroundColor: "hsl(var(--app-bg))" }}
    >
      {/* Background Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Theme Toggle — top right corner */}
      <button
        onClick={toggleTheme}
        title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        className="fixed top-4 right-4 p-2.5 rounded-xl border transition-all duration-200 z-50"
        style={{
          background: "hsl(var(--app-surface))",
          borderColor: "hsl(var(--app-border))",
          color: "hsl(var(--app-text-muted))",
        }}
      >
        {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-500" />}
      </button>

      {/* Login Card */}
      <div
        className="w-full max-w-md rounded-3xl p-8 shadow-2xl relative z-10 border transition-colors duration-200"
        style={{
          background: "hsl(var(--app-surface))",
          borderColor: "hsl(var(--app-border))",
        }}
      >
        {/* Header Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center mx-auto mb-4 shadow-xl text-slate-950 font-bold">
            <Store className="w-9 h-9 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: "hsl(var(--app-text))" }}>
            El Arca Market
          </h1>
          <p className="text-sm mt-1" style={{ color: "hsl(var(--app-text-muted))" }}>
            Gestión Inteligente, POS e IA
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-500 text-xs font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: "hsl(var(--app-text-muted))" }}
            >
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3.5 top-3" style={{ color: "hsl(var(--app-text-dim))" }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@elarcamarket.com"
                className="w-full rounded-xl pl-11 pr-4 py-2.5 text-sm border focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                style={{
                  background: "hsl(var(--app-bg))",
                  borderColor: "hsl(var(--app-border))",
                  color: "hsl(var(--app-text))",
                }}
              />
            </div>
          </div>

          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: "hsl(var(--app-text-muted))" }}
            >
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-3" style={{ color: "hsl(var(--app-text-dim))" }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl pl-11 pr-4 py-2.5 text-sm border focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                style={{
                  background: "hsl(var(--app-bg))",
                  borderColor: "hsl(var(--app-border))",
                  color: "hsl(var(--app-text))",
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            <span>{loading ? "Iniciando sesión..." : "Ingresar al Sistema"}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        {/* Quick Demo Login Preset Buttons */}
        <div className="mt-8 pt-6 border-t" style={{ borderColor: "hsl(var(--app-border))" }}>
          <p className="text-xs text-center font-medium mb-3" style={{ color: "hsl(var(--app-text-dim))" }}>
            Acceso Rápido de Prueba (Demo):
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setPresetUser("admin@elarcamarket.com", "Admin123!")}
              className="px-2.5 py-2 rounded-lg text-xs font-semibold text-emerald-500 flex flex-col items-center gap-1 transition-colors border hover:bg-[hsl(var(--app-hover))]"
              style={{
                background: "hsl(var(--app-surface-2))",
                borderColor: "hsl(var(--app-border))",
              }}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin</span>
            </button>

            <button
              onClick={() => setPresetUser("supervisor@elarcamarket.com", "Super123!")}
              className="px-2.5 py-2 rounded-lg text-xs font-semibold text-teal-500 flex flex-col items-center gap-1 transition-colors border hover:bg-[hsl(var(--app-hover))]"
              style={{
                background: "hsl(var(--app-surface-2))",
                borderColor: "hsl(var(--app-border))",
              }}
            >
              <UserCheck className="w-4 h-4" />
              <span>Supervisor</span>
            </button>

            <button
              onClick={() => setPresetUser("cajero@elarcamarket.com", "Cajero123!")}
              className="px-2.5 py-2 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 transition-colors border hover:bg-[hsl(var(--app-hover))]"
              style={{
                background: "hsl(var(--app-surface-2))",
                borderColor: "hsl(var(--app-border))",
                color: "hsl(var(--app-text-muted))",
              }}
            >
              <Store className="w-4 h-4" />
              <span>Cajero</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

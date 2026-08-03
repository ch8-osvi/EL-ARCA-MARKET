"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Store, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, Sun, Moon, Sparkles, CheckCircle2 } from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";

export default function LoginPage() {
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();
  
  // Login Form States
  const [email, setEmail] = useState("admin@elarcamarket.com");
  const [password, setPassword] = useState("Admin123!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Setup Form States (Auto-Registration if empty database)
  const [setupRequired, setSetupRequired] = useState(false);
  const [setupStep, setSetupStep] = useState(false); // true if showing setup form
  const [shopName, setShopName] = useState("El Arca Market");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [setupSuccess, setSetupSuccess] = useState(false);

  // Check on mount if DB is empty
  useEffect(() => {
    async function checkSetup() {
      try {
        const res = await fetch("/api/auth/setup");
        if (res.ok) {
          const data = await res.json();
          if (data.setupRequired) {
            setSetupRequired(true);
            setSetupStep(true);
          }
        }
      } catch (e) {
        console.error("Error checking setup status:", e);
      }
    }
    checkSetup();
  }, []);

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
      
      if (data.setupRequired) {
        setSetupRequired(true);
        setSetupStep(true);
        setLoading(false);
        return;
      }

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

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: adminName,
          email: adminEmail,
          password: adminPassword,
          businessName: shopName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al configurar el administrador.");
      }

      setSetupSuccess(true);
      setSetupRequired(false);
      // Auto fill login fields with the newly created admin account
      setEmail(adminEmail);
      setPassword(adminPassword);
      
      setTimeout(() => {
        setSetupStep(false);
        setSetupSuccess(false);
      }, 3000);

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al registrar setup");
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

      {/* Theme Toggle */}
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

      {/* Login / Setup Card */}
      <div
        className="w-full max-w-md rounded-3xl p-8 shadow-2xl relative z-10 border transition-colors duration-200"
        style={{
          background: "hsl(var(--app-surface))",
          borderColor: "hsl(var(--app-border))",
        }}
      >
        {/* Header Logo */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center mx-auto mb-4 shadow-xl text-slate-950 font-bold">
            <Store className="w-9 h-9 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: "hsl(var(--app-text))" }}>
            {setupStep ? "Configuración Inicial" : "El Arca Market"}
          </h1>
          <p className="text-sm mt-1" style={{ color: "hsl(var(--app-text-muted))" }}>
            {setupStep ? "Crea la primera cuenta administrador del sistema" : "Gestión Inteligente, POS e IA"}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-500 text-xs font-semibold text-center leading-relaxed">
            {error}
          </div>
        )}

        {/* ── MODO 1: CONFIGURACIÓN INICIAL (SETUP) ── */}
        {setupStep ? (
          setupSuccess ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-[hsl(var(--app-text))]">¡Administrador creado con éxito!</p>
              <p className="text-xs text-[hsl(var(--app-text-muted))]">Redirigiéndote al inicio de sesión...</p>
            </div>
          ) : (
            <form onSubmit={handleSetup} className="space-y-4">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500 text-[11px] font-medium leading-relaxed mb-4 flex items-start gap-2">
                <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                <span>La base de datos está vacía. Registra tu cuenta administradora para inicializar la tienda de forma segura.</span>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "hsl(var(--app-text-muted))" }}>
                  Nombre Comercial del Local
                </label>
                <input
                  type="text"
                  required
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="Ej. El Arca Minimarket"
                  className="w-full rounded-xl px-4 py-2.5 text-xs border focus:outline-none focus:border-emerald-500 transition-colors"
                  style={{
                    background: "hsl(var(--app-bg))",
                    borderColor: "hsl(var(--app-border))",
                    color: "hsl(var(--app-text))",
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "hsl(var(--app-text-muted))" }}>
                  Nombre de Administrador
                </label>
                <input
                  type="text"
                  required
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="Ej. Juan Pérez"
                  className="w-full rounded-xl px-4 py-2.5 text-xs border focus:outline-none focus:border-emerald-500 transition-colors"
                  style={{
                    background: "hsl(var(--app-bg))",
                    borderColor: "hsl(var(--app-border))",
                    color: "hsl(var(--app-text))",
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "hsl(var(--app-text-muted))" }}>
                  Correo de Administrador
                </label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="ejemplo@gmail.com"
                  className="w-full rounded-xl px-4 py-2.5 text-xs border focus:outline-none focus:border-emerald-500 transition-colors"
                  style={{
                    background: "hsl(var(--app-bg))",
                    borderColor: "hsl(var(--app-border))",
                    color: "hsl(var(--app-text))",
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "hsl(var(--app-text-muted))" }}>
                  Contraseña segura
                </label>
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full rounded-xl px-4 py-2.5 text-xs border focus:outline-none focus:border-emerald-500 transition-colors"
                  style={{
                    background: "hsl(var(--app-bg))",
                    borderColor: "hsl(var(--app-border))",
                    color: "hsl(var(--app-text))",
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 text-slate-950 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                <span>{loading ? "Inicializando tienda..." : "Inicializar Sistema"}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          )
        ) : (
          /* ── MODO 2: INICIO DE SESIÓN NORMAL ── */
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "hsl(var(--app-text-muted))" }}>
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
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "hsl(var(--app-text-muted))" }}>
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
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 text-slate-950 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              <span>{loading ? "Iniciando sesión..." : "Ingresar al Sistema"}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        )}

        {/* Quick Demo Login Preset Buttons (Only if not in setup mode) */}
        {!setupStep && (
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
        )}

        {/* Toggle back to login if setup is manually requested and setupRequired is true */}
        {setupRequired && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setSetupStep(!setupStep)}
              className="text-[11px] font-bold text-emerald-500 hover:underline"
            >
              {setupStep ? "← Volver al Login" : "Ir a Configuración Inicial →"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Store, Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const setPresetUser = (presetEmail: string, presetPass: string) => {
    setEmail(presetEmail);
    setPassword(presetPass);
  };

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10">
        {/* Header Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-950 text-slate-950 font-bold">
            <Store className="w-9 h-9 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">El Arca Market</h1>
          <p className="text-sm text-slate-400 mt-1">Gestión Inteligente, POS e IA</p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@elarcamarket.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-950 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            <span>{loading ? "Iniciando sesión..." : "Ingresar al Sistema"}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        {/* Quick Demo Login Preset Buttons */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <p className="text-xs text-slate-500 text-center font-medium mb-3">
            Acceso Rápido de Prueba (Demo):
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setPresetUser("admin@elarcamarket.com", "Admin123!")}
              className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-lg text-xs font-semibold text-emerald-400 flex flex-col items-center gap-1 transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin</span>
            </button>

            <button
              onClick={() => setPresetUser("supervisor@elarcamarket.com", "Super123!")}
              className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-lg text-xs font-semibold text-teal-400 flex flex-col items-center gap-1 transition-colors"
            >
              <UserCheck className="w-4 h-4" />
              <span>Supervisor</span>
            </button>

            <button
              onClick={() => setPresetUser("cajero@elarcamarket.com", "Cajero123!")}
              className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-lg text-xs font-semibold text-slate-300 flex flex-col items-center gap-1 transition-colors"
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

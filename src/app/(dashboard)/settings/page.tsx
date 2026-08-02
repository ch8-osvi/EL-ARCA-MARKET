"use client";

import { useState } from "react";
import { Settings as SettingsIcon, Save, Store, DollarSign, ShieldAlert, Bot } from "lucide-react";

export default function SettingsPage() {
  const [businessName, setBusinessName] = useState("El Arca Market");
  const [currency, setCurrency] = useState("USD");
  const [currencySymbol, setCurrencySymbol] = useState("$");
  const [allowNegativeStock, setAllowNegativeStock] = useState(false);
  const [requireCashSession, setRequireCashSession] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          Configuración General de la Tienda
        </h1>
        <p className="text-sm text-slate-400">
          Parámetros operativos del negocio, moneda e Inteligencia Artificial
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
        {saved && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-bold text-center">
            ¡Configuración guardada exitosamente!
          </div>
        )}

        <div>
          <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Store className="w-4 h-4 text-emerald-400" />
            <span>Datos del Comercio</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Nombre Comercial
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Moneda Principal
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="USD">USD - Dólares US ($)</option>
                <option value="MXN">MXN - Peso Mexicano ($)</option>
                <option value="ARS">ARS - Peso Argentino ($)</option>
                <option value="COP">COP - Peso Colombiano ($)</option>
                <option value="EUR">EUR - Euro (€)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800">
          <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Reglas de Inventario & Caja</span>
          </h2>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={allowNegativeStock}
                onChange={(e) => setAllowNegativeStock(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-950"
              />
              <span className="text-xs text-slate-300">
                Permitir ventas sin existencias (Inventario Negativo)
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={requireCashSession}
                onChange={(e) => setRequireCashSession(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-950"
              />
              <span className="text-xs text-slate-300">
                Requerir apertura obligatoria de sesión de caja antes de cobrar en POS
              </span>
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-950"
          >
            <Save className="w-4 h-4 stroke-[2.5]" />
            <span>Guardar Configuración</span>
          </button>
        </div>
      </form>
    </div>
  );
}

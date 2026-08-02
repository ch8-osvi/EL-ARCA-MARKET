"use client";

import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, AlertTriangle, ShoppingCart, Sparkles, CheckCircle2 } from "lucide-react";

export default function ReportsPage() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        const res = await fetch("/api/reports/summary");
        if (res.ok) {
          const data = await res.json();
          setSummary(data.summary);
        }
      } catch (err) {
        console.error("Error al cargar reportes:", err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          Reportes & Analítica Comercial
        </h1>
        <p className="text-sm text-slate-400">
          Análisis de ventas, márgenes de ganancia y rendimiento determinista del negocio
        </p>
      </div>

      {/* Financial Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Ventas Netas Totales
          </span>
          <div className="text-3xl font-black text-white mt-2">
            ${summary ? (summary.totalNetSales || 0).toFixed(2) : "0.00"}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Descuentos aplicados: ${summary?.totalDiscounts || 0}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Costo de Mercancía Vendida (COGS)
          </span>
          <div className="text-3xl font-black text-rose-400 mt-2">
            ${summary ? (summary.totalCostOfGoods || 0).toFixed(2) : "0.00"}
          </div>
          <p className="text-xs text-slate-400 mt-2">Calculado al costo histórico de venta</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Ganancia Bruta Obtenida
          </span>
          <div className="text-3xl font-black text-emerald-400 mt-2">
            ${summary ? (summary.grossProfit || 0).toFixed(2) : "0.00"}
          </div>
          <p className="text-xs text-emerald-400/90 font-semibold mt-2">
            Margen bruto: {summary?.grossMarginPercent || 0}%
          </p>
        </div>
      </div>
    </div>
  );
}

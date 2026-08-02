"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  Bot,
  Plus,
  Landmark,
  ArrowUpRight,
  Boxes,
  Sparkles,
} from "lucide-react";

export default function DashboardPage() {
  const [summary, setSummary] = useState<any>(null);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        // Trigger DB seed automatically if clean installation
        await fetch("/api/seed");

        const summaryRes = await fetch("/api/reports/summary");
        if (summaryRes.ok) {
          const data = await summaryRes.json();
          setSummary(data.summary);
          setLowStock(data.lowStock || []);
        }
      } catch (err) {
        console.error("Error al cargar panel principal:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Panel de Control General
          </h1>
          <p className="text-sm text-slate-400">
            Resumen en tiempo real del estado comercial de El Arca Market
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/pos"
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-950/40 flex items-center gap-2 text-sm transition-all"
          >
            <ShoppingCart className="w-4 h-4 stroke-[2.5]" />
            <span>Abrir Punto de Venta</span>
          </Link>

          <Link
            href="/ai-assistant"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-400 font-semibold rounded-xl flex items-center gap-2 text-sm transition-colors"
          >
            <Bot className="w-4 h-4" />
            <span>Asistente IA</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Ventas Brutas Hoy
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            ${summary ? (summary.totalGrossSales || 0).toFixed(2) : "0.00"}
          </div>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>{summary?.transactionCount || 0} transacciones registradas</span>
          </p>
        </div>

        {/* Gross Profit Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Ganancia Bruta
            </span>
            <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            ${summary ? (summary.grossProfit || 0).toFixed(2) : "0.00"}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Margen de ganancia:{" "}
            <span className="text-teal-400 font-bold">
              {summary ? (summary.grossMarginPercent || 0) : 0}%
            </span>
          </p>
        </div>

        {/* Average Ticket Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Ticket Promedio
            </span>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            ${summary ? (summary.averageTicket || 0).toFixed(2) : "0.00"}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Unidades vendidas:{" "}
            <span className="text-slate-200 font-bold">{summary?.totalUnitsSold || 0}</span>
          </p>
        </div>

        {/* Low Stock Alert Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Alertas de Stock
            </span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{lowStock.length}</div>
          <p className="text-xs text-amber-400/90 mt-2 font-medium">
            {lowStock.length > 0
              ? `${lowStock.length} productos por debajo del mínimo`
              : "Inventario saludable"}
          </p>
        </div>
      </div>

      {/* Main Grid: AI Suggestions & Low Stock Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Assistant Quick Prompt Widget */}
        <div className="lg:col-span-1 bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/20 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <h2 className="font-bold text-white text-base">Asistente El Arca</h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              ¿Quieres analizar el cuadre de caja, detectar productos sin rotación o calcular compras sugeridas? Haz preguntas en lenguaje natural a la IA.
            </p>

            <div className="space-y-2">
              <Link
                href="/ai-assistant?q=Hazme+el+cuadre+del+dia"
                className="block p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs text-slate-200 font-medium hover:border-emerald-500/40 transition-colors"
              >
                💬 "Hazme el cuadre del día."
              </Link>
              <Link
                href="/ai-assistant?q=Que+productos+deberia+comprar+hoy"
                className="block p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs text-slate-200 font-medium hover:border-emerald-500/40 transition-colors"
              >
                📦 "¿Qué productos debería comprar hoy?"
              </Link>
              <Link
                href="/ai-assistant?q=Hay+alguna+anomalia+en+las+ventas"
                className="block p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs text-slate-200 font-medium hover:border-emerald-500/40 transition-colors"
              >
                ⚠️ "¿Hay alguna anomalía en las ventas?"
              </Link>
            </div>
          </div>

          <Link
            href="/ai-assistant"
            className="mt-6 w-full py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 font-semibold rounded-xl text-center text-xs border border-emerald-500/30 flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Abrir Asistente Completo</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Low Stock Table Widget */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-white text-base flex items-center gap-2">
                <Boxes className="w-5 h-5 text-amber-400" />
                <span>Productos con Stock Bajo</span>
              </h2>
              <p className="text-xs text-slate-400">
                Productos que alcanzaron el umbral mínimo de reposición
              </p>
            </div>
            <Link
              href="/inventory"
              className="text-xs font-semibold text-emerald-400 hover:underline"
            >
              Ver Inventario Completo &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3">SKU</th>
                  <th className="p-3">Producto</th>
                  <th className="p-3 text-center">Stock Actual</th>
                  <th className="p-3 text-center">Mínimo</th>
                  <th className="p-3 text-right">Precio Venta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {lowStock.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-500">
                      No hay productos con alerta de stock bajo.
                    </td>
                  </tr>
                ) : (
                  lowStock.slice(0, 5).map((item) => (
                    <tr key={item._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-mono text-slate-400">{item.sku}</td>
                      <td className="p-3 font-semibold text-white">{item.name}</td>
                      <td className="p-3 text-center font-bold text-amber-400">
                        {item.currentStock} {item.unit}
                      </td>
                      <td className="p-3 text-center text-slate-400">{item.minStock}</td>
                      <td className="p-3 text-right font-semibold text-slate-200">
                        ${item.price?.toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

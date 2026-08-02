"use client";

import { useState, useEffect } from "react";
import { Boxes, ArrowUpRight, ArrowDownLeft, AlertCircle, Plus, Search, RefreshCw } from "lucide-react";

export default function InventoryPage() {
  const [valueStats, setValueStats] = useState<any>(null);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInventoryData();
  }, []);

  async function loadInventoryData() {
    try {
      const res = await fetch("/api/reports/summary");
      if (res.ok) {
        const data = await res.json();
        setLowStock(data.lowStock || []);
      }
    } catch (err) {
      console.error("Error al cargar inventario:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Inventario & Kardex
          </h1>
          <p className="text-sm text-slate-400">
            Control inmutable de movimientos de existencias y valoración de inventario
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Productos con Stock Bajo
          </span>
          <div className="text-2xl font-black text-amber-400 mt-2">{lowStock.length}</div>
          <p className="text-xs text-slate-400 mt-1">Requieren reposición a proveedor</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Libro de Movimientos (Kardex)
          </span>
          <div className="text-2xl font-black text-emerald-400 mt-2">Activo</div>
          <p className="text-xs text-slate-400 mt-1">Auditoría inmutable habilitada</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Estrategia de Costeo
          </span>
          <div className="text-2xl font-black text-teal-400 mt-2">Promedio Ponderado</div>
          <p className="text-xs text-slate-400 mt-1">Costo exacto por transacción</p>
        </div>
      </div>

      {/* Low Stock List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h2 className="font-bold text-white text-base mb-4 flex items-center gap-2">
          <Boxes className="w-5 h-5 text-amber-400" />
          <span>Alertas de Inventario Bajo</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">SKU</th>
                <th className="p-3">Producto</th>
                <th className="p-3 text-center">Stock Actual</th>
                <th className="p-3 text-center">Stock Mínimo</th>
                <th className="p-3 text-center">Déficit</th>
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
                lowStock.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-mono text-slate-400">{item.sku}</td>
                    <td className="p-3 font-bold text-white">{item.name}</td>
                    <td className="p-3 text-center font-bold text-amber-400">
                      {item.currentStock} {item.unit}
                    </td>
                    <td className="p-3 text-center text-slate-400">{item.minStock}</td>
                    <td className="p-3 text-center font-bold text-rose-400">
                      -{item.deficit} {item.unit}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Receipt, Plus, DollarSign, Calendar, Tag } from "lucide-react";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([
    {
      id: "exp-1",
      category: "Transporte / Flete",
      description: "Pago de flete recepción mercancía refrescos",
      amount: 15.0,
      paymentMethod: "Efectivo de Caja",
      date: new Date().toLocaleDateString("es-ES"),
    },
    {
      id: "exp-2",
      category: "Servicios Básicos",
      description: "Pago servicio electricidad local",
      amount: 45.0,
      paymentMethod: "Efectivo de Caja",
      date: new Date().toLocaleDateString("es-ES"),
    },
  ]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Gastos Operativos
          </h1>
          <p className="text-sm text-slate-400">
            Registro de egresos y costos operativos diferenciados de compras de mercancía
          </p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 font-bold text-white text-sm">
          Historial de Gastos Registrados
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4">Fecha</th>
                <th className="p-4">Categoría</th>
                <th className="p-4">Descripción</th>
                <th className="p-4 text-right">Monto</th>
                <th className="p-4 text-center">Método de Pago</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 text-slate-400 font-mono">{exp.date}</td>
                  <td className="p-4 font-bold text-white">{exp.category}</td>
                  <td className="p-4 text-slate-300">{exp.description}</td>
                  <td className="p-4 text-right font-mono font-bold text-rose-400">
                    -${exp.amount.toFixed(2)}
                  </td>
                  <td className="p-4 text-center text-slate-400">{exp.paymentMethod}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

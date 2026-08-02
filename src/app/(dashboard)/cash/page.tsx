"use client";

import { useState, useEffect } from "react";
import {
  Landmark,
  Plus,
  Minus,
  CheckCircle,
  AlertTriangle,
  Lock,
  Unlock,
  DollarSign,
  User,
  Clock,
  FileText,
} from "lucide-react";

export default function CashPage() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Forms State
  const [initialCashInput, setInitialCashInput] = useState("100.00");
  const [countedCashInput, setCountedCashInput] = useState("");
  const [differenceReasonInput, setDifferenceReasonInput] = useState("");

  const [movementAmount, setMovementAmount] = useState("");
  const [movementReason, setMovementReason] = useState("");
  const [movementType, setMovementType] = useState<"in" | "out">("in");

  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);

  useEffect(() => {
    loadSession();
  }, []);

  async function loadSession() {
    try {
      const res = await fetch("/api/cash");
      if (res.ok) {
        const data = await res.json();
        setSession(data.session);
      }
    } catch (err) {
      console.error("Error al cargar sesión de caja:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/cash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "open",
          initialCash: parseFloat(initialCashInput) || 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSession(data.session);
    } catch (err: any) {
      alert(`Error al abrir caja: ${err.message}`);
    }
  };

  const handleRecordMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    try {
      const res = await fetch("/api/cash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "movement",
          sessionId: session._id,
          type: movementType,
          amount: parseFloat(movementAmount),
          reason: movementReason,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setIsMovementModalOpen(false);
      setMovementAmount("");
      setMovementReason("");
      loadSession();
    } catch (err: any) {
      alert(`Error al registrar movimiento: ${err.message}`);
    }
  };

  const handleCloseSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    try {
      const res = await fetch("/api/cash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "close",
          sessionId: session._id,
          countedCash: parseFloat(countedCashInput) || 0,
          differenceReason: differenceReasonInput,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setIsCloseModalOpen(false);
      setCountedCashInput("");
      setDifferenceReasonInput("");
      loadSession();
    } catch (err: any) {
      alert(`Error al cerrar caja: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Control & Cuadre de Caja
          </h1>
          <p className="text-sm text-slate-400">
            Apertura, movimientos manuales de efectivo y cierre diario de caja
          </p>
        </div>

        {session && session.status === "open" && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMovementModalOpen(true)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold rounded-xl text-sm transition-colors flex items-center gap-2"
            >
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Entrada / Salida Efectivo</span>
            </button>

            <button
              onClick={() => setIsCloseModalOpen(true)}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-rose-950/40 flex items-center gap-2 transition-all"
            >
              <Lock className="w-4 h-4" />
              <span>Cerrar & Cuadrar Caja</span>
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
          Cargando estado de la caja...
        </div>
      ) : !session || session.status === "closed" ? (
        /* Open Cash Form */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md mx-auto text-center shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <Unlock className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold text-white mb-1">Caja Cerrada</h2>
          <p className="text-xs text-slate-400 mb-6">
            Debes ingresar el fondo inicial para abrir la sesión de caja del turno.
          </p>

          <form onSubmit={handleOpenSession} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Fondo Inicial en Efectivo ($)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={initialCashInput}
                onChange={(e) => setInitialCashInput(e.target.value)}
                placeholder="100.00"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-lg font-mono text-white text-center focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-slate-950 font-extrabold rounded-xl text-sm shadow-lg shadow-emerald-950"
            >
              Abrir Sesión de Caja
            </button>
          </form>
        </div>
      ) : (
        /* Active Open Session Dashboard */
        <div className="space-y-6">
          {/* Active Session Status Header */}
          <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  ● Sesión de Caja Activa
                </span>
                <h2 className="text-xl font-extrabold text-white mt-2">
                  {session.registerName || "Caja Principal"}
                </h2>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    Responsable: {session.userId?.name || "Cajero"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    Abierta: {new Date(session.openedAt).toLocaleTimeString("es-ES")}
                  </span>
                </p>
              </div>

              <div className="text-right bg-slate-950 border border-slate-800 rounded-xl p-4 min-w-[200px]">
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Efectivo Esperado en Caja
                </span>
                <span className="text-2xl font-black text-emerald-400 font-mono">
                  ${(session.expectedCash || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Breakdown Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="block text-xs text-slate-400">Fondo Inicial</span>
              <span className="text-lg font-bold text-white font-mono">
                ${(session.initialCash || 0).toFixed(2)}
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="block text-xs text-slate-400">Ventas en Efectivo</span>
              <span className="text-lg font-bold text-emerald-400 font-mono">
                ${(session.cashSalesTotal || 0).toFixed(2)}
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="block text-xs text-slate-400">Ventas con Tarjeta / Transfer</span>
              <span className="text-lg font-bold text-teal-400 font-mono">
                ${((session.cardSalesTotal || 0) + (session.transferSalesTotal || 0)).toFixed(2)}
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="block text-xs text-slate-400">Entradas / Salidas Manuales</span>
              <span className="text-lg font-bold text-slate-200 font-mono">
                +${session.cashIns || 0} / -${session.cashOuts || 0}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Record Movement Modal */}
      {isMovementModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-4">Registrar Movimiento de Efectivo</h3>

            <form onSubmit={handleRecordMovement} className="space-y-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMovementType("in")}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border ${
                    movementType === "in"
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                      : "bg-slate-950 border-slate-800 text-slate-400"
                  }`}
                >
                  + Entrada de Efectivo
                </button>
                <button
                  type="button"
                  onClick={() => setMovementType("out")}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border ${
                    movementType === "out"
                      ? "bg-rose-500/20 border-rose-500 text-rose-400"
                      : "bg-slate-950 border-slate-800 text-slate-400"
                  }`}
                >
                  - Salida / Retiro
                </button>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Monto ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={movementAmount}
                  onChange={(e) => setMovementAmount(e.target.value)}
                  placeholder="20.00"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Motivo / Justificación *</label>
                <input
                  type="text"
                  required
                  value={movementReason}
                  onChange={(e) => setMovementReason(e.target.value)}
                  placeholder="ej. Retiro de seguridad / Pago de cambio inicial"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMovementModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-800 text-slate-300 font-semibold rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs"
                >
                  Guardar Movimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Close Session & Cuadre Modal */}
      {isCloseModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-2">Cuadre y Cierre de Caja</h3>
            <p className="text-xs text-slate-400 mb-4">
              Cuenta el dinero físico en efectivo existente e ingresa la cantidad exacta.
            </p>

            <form onSubmit={handleCloseSession} className="space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Efectivo Esperado:</span>
                  <span className="text-white font-bold font-mono">
                    ${(session?.expectedCash || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Efectivo Físico Contado ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={countedCashInput}
                  onChange={(e) => setCountedCashInput(e.target.value)}
                  placeholder={(session?.expectedCash || 0).toFixed(2)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-lg font-mono text-white text-center focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {countedCashInput &&
                Math.abs(parseFloat(countedCashInput) - (session?.expectedCash || 0)) > 0.01 && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs space-y-2">
                    <p className="text-amber-400 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      <span>
                        Diferencia detectada: $
                        {(parseFloat(countedCashInput) - session?.expectedCash).toFixed(2)}
                      </span>
                    </p>
                    <input
                      type="text"
                      required
                      value={differenceReasonInput}
                      onChange={(e) => setDifferenceReasonInput(e.target.value)}
                      placeholder="Ingresa el motivo de la diferencia..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCloseModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-800 text-slate-300 font-semibold rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-rose-950"
                >
                  Confirmar y Cerrar Caja
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

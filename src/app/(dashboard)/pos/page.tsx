"use client";

import { useState, useEffect, useRef } from "react";
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CheckCircle,
  Barcode,
  CreditCard,
  Banknote,
  Send,
  X,
  Receipt,
  Sparkles,
  RefreshCw,
} from "lucide-react";

interface ProductItem {
  _id: string;
  sku: string;
  barcode?: string;
  name: string;
  price: number;
  cost: number;
  stock: number;
  unit: string;
  categoryId?: { name: string; color?: string };
}

interface CartLine {
  product: ProductItem;
  quantity: number;
  unitPrice: number;
  discount: number;
}

export default function POSPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "transfer">("cash");
  const [cashReceived, setCashReceived] = useState<string>("");
  const [customerName, setCustomerName] = useState("Cliente General");
  const [processing, setProcessing] = useState(false);
  const [completedSale, setCompletedSale] = useState<any>(null);
  const [activeSession, setActiveSession] = useState<any>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProducts();
    loadCashSession();
  }, []);

  async function loadProducts(query: string = "") {
    try {
      const res = await fetch(`/api/products?search=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error("Error al cargar productos:", err);
    }
  }

  async function loadCashSession() {
    try {
      const res = await fetch("/api/cash");
      if (res.ok) {
        const data = await res.json();
        setActiveSession(data.session);
      }
    } catch (err) {
      console.error("Error al cargar sesión de caja:", err);
    }
  }

  const addToCart = (product: ProductItem) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((line) => line.product._id === product._id);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += 1;
        return updated;
      }
      return [
        ...prevCart,
        {
          product,
          quantity: 1,
          unitPrice: product.price,
          discount: 0,
        },
      ];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((line) => {
          if (line.product._id === productId) {
            const newQty = line.quantity + delta;
            return newQty > 0 ? { ...line, quantity: newQty } : null;
          }
          return line;
        })
        .filter(Boolean) as CartLine[]
    );
  };

  const removeLine = (productId: string) => {
    setCart((prev) => prev.filter((line) => line.product._id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setCashReceived("");
  };

  const subtotal = cart.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  const totalDiscount = cart.reduce((sum, line) => sum + line.discount, 0);
  const total = Math.max(0, subtotal - totalDiscount);

  const cashReceivedNum = parseFloat(cashReceived) || total;
  const changeGiven = Math.max(0, cashReceivedNum - total);

  const handleCheckout = async () => {
    if (cart.length === 0 || processing) return;
    setProcessing(true);

    try {
      const idempotencyKey = `POS-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

      const payload = {
        cashSessionId: activeSession?._id,
        customerName,
        items: cart.map((line) => ({
          productId: line.product._id,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          discount: line.discount,
        })),
        payments: [
          {
            method: paymentMethod,
            amount: total,
          },
        ],
        cashReceived: paymentMethod === "cash" ? cashReceivedNum : total,
        idempotencyKey,
      };

      const res = await fetch("/api/pos/sale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al procesar la venta.");
      }

      setCompletedSale(data.sale);
      clearCart();
      loadProducts(search);
    } catch (err: any) {
      alert(`Error al registrar la venta: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col md:flex-row gap-4 max-w-[1600px] mx-auto select-none">
      {/* Left Column: Catalog Search & Product Grid */}
      <div className="flex-1 flex flex-col bg-slate-900 border border-slate-800 rounded-2xl p-4 overflow-hidden">
        {/* Search Bar & Barcode scan simulation */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                loadProducts(e.target.value);
              }}
              placeholder="Buscar por Nombre, SKU o Código de Barras..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          <button
            onClick={() => loadProducts("")}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl transition-colors"
            title="Refrescar catálogo"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 pr-1">
          {products.map((product) => {
            const isOutOfStock = product.stock <= 0;
            return (
              <button
                key={product._id}
                disabled={isOutOfStock}
                onClick={() => addToCart(product)}
                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all duration-150 relative group ${
                  isOutOfStock
                    ? "bg-slate-950/40 border-slate-800/50 opacity-50 cursor-not-allowed"
                    : "bg-slate-950 border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/50 active:scale-[0.98]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                    <span>{product.sku}</span>
                    <span
                      className={`font-semibold ${
                        product.stock <= 5 ? "text-amber-400" : "text-emerald-400"
                      }`}
                    >
                      Stock: {product.stock}
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-xs line-clamp-2 mb-2">
                    {product.name}
                  </h3>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80">
                  <span className="text-base font-extrabold text-emerald-400">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center text-xs font-bold group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                    +
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Column: Active Cart & Checkout Panel */}
      <div className="w-full md:w-[420px] bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
        <div>
          {/* Cart Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <h2 className="font-bold text-white text-base flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-emerald-400" />
              <span>Carrito de Compra</span>
            </h2>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-rose-400 hover:underline font-semibold"
              >
                Vaciar Carrito
              </button>
            )}
          </div>

          {/* Cart Line Items */}
          <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
            {cart.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-30 stroke-1" />
                <p className="text-xs">El carrito está vacío.</p>
                <p className="text-[11px] text-slate-600 mt-1">
                  Selecciona productos del catálogo para comenzar.
                </p>
              </div>
            ) : (
              cart.map((line) => (
                <div
                  key={line.product._id}
                  className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-white text-xs truncate">
                      {line.product.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-mono">
                      ${line.unitPrice.toFixed(2)} c/u
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(line.product._id, -1)}
                      className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold"
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-bold text-white text-xs">
                      {line.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(line.product._id, 1)}
                      className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold"
                    >
                      +
                    </button>

                    <button
                      onClick={() => removeLine(line.product._id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors ml-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Payment & Totals Footer */}
        <div className="pt-4 border-t border-slate-800 space-y-4">
          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Método de Pago
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("cash")}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                  paymentMethod === "cash"
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800"
                }`}
              >
                <Banknote className="w-4 h-4" />
                <span>Efectivo</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                  paymentMethod === "card"
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800"
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Tarjeta</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("transfer")}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                  paymentMethod === "transfer"
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800"
                }`}
              >
                <Send className="w-4 h-4" />
                <span>Transfer</span>
              </button>
            </div>
          </div>

          {/* Cash Received Input */}
          {paymentMethod === "cash" && (
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="block text-[11px] text-slate-400 mb-1">
                  Efectivo Recibido:
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  placeholder={total.toFixed(2)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="text-right">
                <span className="block text-[11px] text-slate-400 mb-1">Cambio a Entregar:</span>
                <span className="text-base font-extrabold text-teal-400 font-mono">
                  ${changeGiven.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Totals Breakdown */}
          <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 space-y-1 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {totalDiscount > 0 && (
              <div className="flex justify-between text-rose-400">
                <span>Descuento:</span>
                <span>-${totalDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-black text-white pt-1 border-t border-slate-800">
              <span>TOTAL A COBRAR:</span>
              <span className="text-emerald-400 font-mono">${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Pay Button */}
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || processing}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-extrabold rounded-xl shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <CheckCircle className="w-5 h-5 stroke-[2.5]" />
            <span>{processing ? "Procesando Venta..." : "COBRAR VENTA"}</span>
          </button>
        </div>
      </div>

      {/* Completed Digital Receipt Modal */}
      {completedSale && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl relative">
            <button
              onClick={() => setCompletedSale(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white">¡Venta Exitosa!</h3>
            <p className="text-xs text-slate-400 font-mono mb-4">
              Recibo N° {completedSale.receiptNumber}
            </p>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-left text-xs font-mono space-y-2 mb-6">
              <div className="flex justify-between text-slate-400">
                <span>Total Cobrado:</span>
                <span className="text-white font-bold">${completedSale.total?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Método de Pago:</span>
                <span className="text-emerald-400 capitalize">
                  {completedSale.payments[0]?.method}
                </span>
              </div>
              {completedSale.payments[0]?.method === "cash" && (
                <div className="flex justify-between text-slate-400">
                  <span>Cambio Entregado:</span>
                  <span className="text-teal-400 font-bold">
                    ${completedSale.changeGiven?.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() => setCompletedSale(null)}
              className="w-full py-2.5 bg-emerald-500 text-slate-950 font-bold rounded-xl text-sm"
            >
              Continuar Vendiendo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

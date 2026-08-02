"use client";

import { useState, useEffect } from "react";
import {
  Package,
  Plus,
  Search,
  Tag,
  AlertCircle,
  Download,
  X,
  Edit2,
  Check,
} from "lucide-react";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    sku: "",
    barcode: "",
    name: "",
    shortName: "",
    cost: "",
    price: "",
    stock: "0",
    minStock: "5",
    unit: "unidad",
    controlType: "simple",
  });

  useEffect(() => {
    loadProducts();
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
    } finally {
      setLoading(false);
    }
  }

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al crear el producto.");
      }

      setIsModalOpen(false);
      setFormData({
        sku: "",
        barcode: "",
        name: "",
        shortName: "",
        cost: "",
        price: "",
        stock: "0",
        minStock: "5",
        unit: "unidad",
        controlType: "simple",
      });
      loadProducts(search);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const exportCSV = () => {
    const headers = ["SKU", "CodigoBarras", "Nombre", "Costo", "Precio", "Stock", "MinStock", "Unidad"];
    const rows = products.map((p) => [
      p.sku,
      p.barcode || "",
      `"${p.name}"`,
      p.cost,
      p.price,
      p.stock,
      p.minStock,
      p.unit,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `productos_arca_market_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Catálogo de Productos
          </h1>
          <p className="text-sm text-slate-400">
            Administración general de inventario, precios y existencias
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportCSV}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold rounded-xl flex items-center gap-2 text-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-950/40 flex items-center gap-2 text-sm transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
          <input
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
      </div>

      {/* Products Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4">SKU / Código</th>
                <th className="p-4">Producto</th>
                <th className="p-4">Categoría</th>
                <th className="p-4 text-right">Costo</th>
                <th className="p-4 text-right">Precio Venta</th>
                <th className="p-4 text-center">Stock</th>
                <th className="p-4 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Cargando productos...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No se encontraron productos registrados.
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const isLowStock = product.stock <= product.minStock;
                  return (
                    <tr key={product._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-mono text-slate-300">
                        <div className="font-bold text-white">{product.sku}</div>
                        {product.barcode && (
                          <div className="text-[10px] text-slate-500">{product.barcode}</div>
                        )}
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-white text-sm">{product.name}</div>
                        <div className="text-[11px] text-slate-400">
                          {product.unit} • Control: {product.controlType}
                        </div>
                      </td>

                      <td className="p-4 text-slate-300">
                        <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-[11px] font-medium">
                          {product.categoryId?.name || "General"}
                        </span>
                      </td>

                      <td className="p-4 text-right font-mono text-slate-400">
                        ${product.cost?.toFixed(2)}
                      </td>

                      <td className="p-4 text-right font-mono font-bold text-emerald-400">
                        ${product.price?.toFixed(2)}
                      </td>

                      <td className="p-4 text-center">
                        <span
                          className={`font-mono font-bold text-sm ${
                            isLowStock ? "text-amber-400" : "text-slate-200"
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        {isLowStock ? (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                            Bajo Stock
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                            Disponible
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-white mb-4">Registrar Nuevo Producto</h2>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    SKU del Producto *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="BEB-COCA-600"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white uppercase focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Código de Barras
                  </label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    placeholder="7501055300075"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Nombre Comercial del Producto *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Coca-Cola 600ml"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Costo Unitario ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    placeholder="0.80"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Precio Venta ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="1.50"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Stock Inicial
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Stock Mínimo (Alerta)
                  </label>
                  <input
                    type="number"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-emerald-950 mt-4"
              >
                Guardar Producto
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

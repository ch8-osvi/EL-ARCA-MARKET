"use client";

import { useState, useEffect } from "react";
import {
  Settings as SettingsIcon,
  Save,
  Store,
  ShieldAlert,
  Users,
  UserPlus,
  Trash2,
  CheckCircle,
  ShieldCheck,
  UserCheck,
  Lock,
  Mail,
  User as UserIcon,
} from "lucide-react";

interface UserItem {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "supervisor" | "cashier";
  active: boolean;
  createdAt?: string;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"general" | "users">("general");

  // General Settings State
  const [businessName, setBusinessName] = useState("El Arca Market");
  const [currency, setCurrency] = useState("USD");
  const [allowNegativeStock, setAllowNegativeStock] = useState(false);
  const [requireCashSession, setRequireCashSession] = useState(true);
  const [saved, setSaved] = useState(false);

  // Users State
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // New User Form State
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "supervisor" | "cashier">("cashier");
  const [creatingUser, setCreatingUser] = useState(false);
  const [userMsg, setUserMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (e) {
      console.error("Error al cargar usuarios:", e);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingUser(true);
    setUserMsg(null);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          password: newPassword,
          role: newRole,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al crear usuario.");
      }

      setUserMsg({ type: "success", text: data.message || "Usuario creado exitosamente." });
      setNewName("");
      setNewEmail("");
      setNewPassword("");
      setNewRole("cashier");
      fetchUsers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al crear usuario";
      setUserMsg({ type: "error", text: msg });
    } finally {
      setCreatingUser(false);
    }
  };

  const handleToggleActive = async (userId: string, currentActive: boolean) => {
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, active: !currentActive }),
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (e) {
      console.error("Error al cambiar estado:", e);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este usuario?")) return;

    try {
      const res = await fetch(`/api/users?id=${userId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Error al eliminar usuario.");
        return;
      }
      fetchUsers();
    } catch (e) {
      console.error("Error al eliminar usuario:", e);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/20 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Administrador
          </span>
        );
      case "supervisor":
        return (
          <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-teal-500/10 text-teal-500 border border-teal-500/20 flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5" />
            Supervisor
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1">
            <Store className="w-3.5 h-3.5" />
            Cajero
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2 text-[hsl(var(--app-text))]">
          <SettingsIcon className="w-6 h-6 text-emerald-500" />
          <span>Configuración del Sistema</span>
        </h1>
        <p className="text-sm text-[hsl(var(--app-text-muted))]">
          Parámetros operativos del negocio y administración de usuarios y permisos por rol.
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 border-b border-[hsl(var(--app-border))] pb-2">
        <button
          onClick={() => setActiveTab("general")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === "general"
              ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-sm"
              : "text-[hsl(var(--app-text-muted))] hover:bg-[hsl(var(--app-hover))]"
          }`}
        >
          <Store className="w-4 h-4" />
          <span>General de la Tienda</span>
        </button>

        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === "users"
              ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-sm"
              : "text-[hsl(var(--app-text-muted))] hover:bg-[hsl(var(--app-hover))]"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Usuarios & Roles Autorizados ({users.length})</span>
        </button>
      </div>

      {/* ── TAB 1: CONFIGURACIÓN GENERAL ── */}
      {activeTab === "general" && (
        <form
          onSubmit={handleSaveGeneral}
          className="bg-[hsl(var(--app-surface))] border border-[hsl(var(--app-border))] rounded-3xl p-6 space-y-6 shadow-xl"
        >
          {saved && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-500 text-xs font-bold text-center flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>¡Configuración guardada exitosamente!</span>
            </div>
          )}

          <div>
            <h2 className="text-sm font-bold text-[hsl(var(--app-text))] mb-3 flex items-center gap-2">
              <Store className="w-4 h-4 text-emerald-500" />
              <span>Datos del Comercio</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[hsl(var(--app-text-muted))] mb-1">
                  Nombre Comercial
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full bg-[hsl(var(--app-bg))] border border-[hsl(var(--app-border))] rounded-xl px-3 py-2 text-xs text-[hsl(var(--app-text))] focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[hsl(var(--app-text-muted))] mb-1">
                  Moneda Principal
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-[hsl(var(--app-bg))] border border-[hsl(var(--app-border))] rounded-xl px-3 py-2 text-xs text-[hsl(var(--app-text))] focus:border-emerald-500 focus:outline-none"
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

          <div className="pt-4 border-t border-[hsl(var(--app-border))]">
            <h2 className="text-sm font-bold text-[hsl(var(--app-text))] mb-3 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <span>Reglas Operativas</span>
            </h2>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowNegativeStock}
                  onChange={(e) => setAllowNegativeStock(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500"
                />
                <span className="text-xs text-[hsl(var(--app-text))]">
                  Permitir ventas sin existencias (Inventario Negativo)
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requireCashSession}
                  onChange={(e) => setRequireCashSession(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500"
                />
                <span className="text-xs text-[hsl(var(--app-text))]">
                  Requerir apertura obligatoria de sesión de caja antes de cobrar en POS
                </span>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-[hsl(var(--app-border))] flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg"
            >
              <Save className="w-4 h-4 stroke-[2.5]" />
              <span>Guardar Configuración</span>
            </button>
          </div>
        </form>
      )}

      {/* ── TAB 2: GESTIÓN DE USUARIOS Y ROLES ── */}
      {activeTab === "users" && (
        <div className="space-y-6">
          {/* Formulario Agregar Usuario */}
          <form
            onSubmit={handleCreateUser}
            className="bg-[hsl(var(--app-surface))] border border-[hsl(var(--app-border))] rounded-3xl p-6 space-y-4 shadow-xl"
          >
            <h2 className="text-sm font-bold text-[hsl(var(--app-text))] flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-emerald-500" />
              <span>Registrar Nuevo Usuario o Permiso</span>
            </h2>

            {userMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-bold text-center ${
                  userMsg.type === "success"
                    ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-500"
                    : "bg-rose-500/10 border border-rose-500/30 text-rose-500"
                }`}
              >
                {userMsg.text}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[hsl(var(--app-text-muted))] mb-1">
                  Nombre Completo
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-2.5 top-2.5 text-[hsl(var(--app-text-dim))]" />
                  <input
                    type="text"
                    required
                    placeholder="Ej. María Pérez"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-[hsl(var(--app-bg))] border border-[hsl(var(--app-border))] rounded-xl pl-8 pr-3 py-2 text-xs text-[hsl(var(--app-text))] focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[hsl(var(--app-text-muted))] mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-2.5 top-2.5 text-[hsl(var(--app-text-dim))]" />
                  <input
                    type="email"
                    required
                    placeholder="usuario@tienda.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full bg-[hsl(var(--app-bg))] border border-[hsl(var(--app-border))] rounded-xl pl-8 pr-3 py-2 text-xs text-[hsl(var(--app-text))] focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[hsl(var(--app-text-muted))] mb-1">
                  Contraseña Inicial
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-2.5 top-2.5 text-[hsl(var(--app-text-dim))]" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[hsl(var(--app-bg))] border border-[hsl(var(--app-border))] rounded-xl pl-8 pr-3 py-2 text-xs text-[hsl(var(--app-text))] focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[hsl(var(--app-text-muted))] mb-1">
                  Rol / Nivel de Acceso
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full bg-[hsl(var(--app-bg))] border border-[hsl(var(--app-border))] rounded-xl px-3 py-2 text-xs text-[hsl(var(--app-text))] focus:border-emerald-500 focus:outline-none font-semibold"
                >
                  <option value="cashier">🛒 Cajero (Sólo POS y Caja)</option>
                  <option value="supervisor">👔 Supervisor (Inventario y Reportes)</option>
                  <option value="admin">👑 Administrador (Acceso Total)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={creatingUser}
                className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg disabled:opacity-50"
              >
                <UserPlus className="w-4 h-4" />
                <span>{creatingUser ? "Creando..." : "Crear Usuario"}</span>
              </button>
            </div>
          </form>

          {/* Tabla de Usuarios Registrados */}
          <div className="bg-[hsl(var(--app-surface))] border border-[hsl(var(--app-border))] rounded-3xl p-6 shadow-xl">
            <h2 className="text-sm font-bold text-[hsl(var(--app-text))] mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-500" />
                <span>Lista de Usuarios del Sistema</span>
              </span>
              <span className="text-xs font-normal text-[hsl(var(--app-text-muted))]">
                Total: {users.length} usuarios
              </span>
            </h2>

            {loadingUsers ? (
              <div className="p-8 text-center text-xs text-[hsl(var(--app-text-muted))]">
                Cargando lista de usuarios...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[hsl(var(--app-border))] text-[hsl(var(--app-text-muted))] font-semibold">
                      <th className="pb-3 px-2">Usuario</th>
                      <th className="pb-3 px-2">Correo Electrónico</th>
                      <th className="pb-3 px-2">Rol / Permiso</th>
                      <th className="pb-3 px-2">Estado</th>
                      <th className="pb-3 px-2 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[hsl(var(--app-border-soft))]">
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-[hsl(var(--app-hover))] transition-colors">
                        <td className="py-3.5 px-2 font-semibold text-[hsl(var(--app-text))] flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold text-[10px] uppercase">
                            {u.name.slice(0, 2)}
                          </div>
                          <span>{u.name}</span>
                        </td>
                        <td className="py-3.5 px-2 text-[hsl(var(--app-text-muted))]">{u.email}</td>
                        <td className="py-3.5 px-2">{getRoleBadge(u.role)}</td>
                        <td className="py-3.5 px-2">
                          <button
                            onClick={() => handleToggleActive(u._id, u.active)}
                            className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border transition-colors ${
                              u.active
                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                            }`}
                          >
                            {u.active ? "Activo" : "Inactivo"}
                          </button>
                        </td>
                        <td className="py-3.5 px-2 text-right">
                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            title="Eliminar usuario"
                            className="p-1.5 text-[hsl(var(--app-text-muted))] hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export type Role = "admin" | "supervisor" | "cashier";

export type Permission =
  | "users:manage"
  | "settings:manage"
  | "products:create"
  | "products:edit"
  | "products:delete"
  | "products:view_cost"
  | "inventory:adjust"
  | "inventory:receive"
  | "inventory:view"
  | "pos:sales_create"
  | "pos:sales_void"
  | "pos:sales_discount"
  | "pos:change_price"
  | "cash:open_close"
  | "cash:reopen"
  | "cash:view_all"
  | "expenses:create"
  | "expenses:view"
  | "reports:view_financials"
  | "reports:view_sales"
  | "ai:use"
  | "ai:confirm_actions"
  | "audit:view";

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    "users:manage",
    "settings:manage",
    "products:create",
    "products:edit",
    "products:delete",
    "products:view_cost",
    "inventory:adjust",
    "inventory:receive",
    "inventory:view",
    "pos:sales_create",
    "pos:sales_void",
    "pos:sales_discount",
    "pos:change_price",
    "cash:open_close",
    "cash:reopen",
    "cash:view_all",
    "expenses:create",
    "expenses:view",
    "reports:view_financials",
    "reports:view_sales",
    "ai:use",
    "ai:confirm_actions",
    "audit:view",
  ],
  supervisor: [
    "products:create",
    "products:edit",
    "products:view_cost",
    "inventory:receive",
    "inventory:view",
    "pos:sales_create",
    "pos:sales_void",
    "pos:sales_discount",
    "cash:open_close",
    "expenses:create",
    "expenses:view",
    "reports:view_sales",
    "ai:use",
    "ai:confirm_actions",
  ],
  cashier: [
    "products:view",
    "inventory:view",
    "pos:sales_create",
    "cash:open_close",
    "ai:use",
  ],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  if (!role || !ROLE_PERMISSIONS[role]) return false;
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

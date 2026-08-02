import mongoose from "mongoose";
import { connectDB } from "./mongodb";
import { Organization } from "@/models/Organization";
import { Store } from "@/models/Store";
import { User } from "@/models/User";
import { Settings } from "@/models/Settings";
import { Category } from "@/models/Category";
import { Product } from "@/models/Product";
import { Supplier } from "@/models/Supplier";
import { CashSession } from "@/models/CashSession";
import { hashPassword } from "@/lib/auth/jwt";

export async function seedDatabase() {
  await connectDB();
  console.log("🌱 Iniciando siembra de datos de prueba para El Arca Market...");

  // 1. Limpieza segura de colecciones principales para desarrollo
  await Organization.deleteMany({});
  await Store.deleteMany({});
  await User.deleteMany({});
  await Settings.deleteMany({});
  await Category.deleteMany({});
  await Product.deleteMany({});
  await Supplier.deleteMany({});
  await CashSession.deleteMany({});

  // 2. Crear Organización y Sucursal Principal
  const adminPasswordHash = await hashPassword("Admin123!");

  const tempUserId = new mongoose.Types.ObjectId();
  const organization = await Organization.create({
    name: "El Arca Market Inc.",
    taxId: "J-12345678-0",
    ownerId: tempUserId,
  });

  const store = await Store.create({
    organizationId: organization._id,
    name: "El Arca Market - Sucursal Principal",
    code: "STORE-01",
    phone: "+1 (800) 555-0199",
    address: "Av. San Martín, Edificio El Arca, Local 1",
  });

  // 3. Crear Usuarios Iniciales (Admin, Encargado, Cajero)
  const adminUser = await User.create({
    _id: tempUserId,
    organizationId: organization._id,
    storeId: store._id,
    name: "Administrador General",
    email: "admin@elarcamarket.com",
    passwordHash: adminPasswordHash,
    role: "admin",
    active: true,
  });

  const supervisorPasswordHash = await hashPassword("Super123!");
  const supervisorUser = await User.create({
    organizationId: organization._id,
    storeId: store._id,
    name: "Encargado de Tienda",
    email: "supervisor@elarcamarket.com",
    passwordHash: supervisorPasswordHash,
    role: "supervisor",
    active: true,
  });

  const cashierPasswordHash = await hashPassword("Cajero123!");
  const cashierUser = await User.create({
    organizationId: organization._id,
    storeId: store._id,
    name: "Cajero 1 - María González",
    email: "cajero@elarcamarket.com",
    passwordHash: cashierPasswordHash,
    role: "cashier",
    active: true,
  });

  // 4. Configuración del Negocio
  await Settings.create({
    organizationId: organization._id,
    storeId: store._id,
    businessName: "El Arca Market",
    phone: "+1 (800) 555-0199",
    address: "Av. San Martín, Edificio El Arca, Local 1",
    currency: "USD",
    currencySymbol: "$",
    decimalPlaces: 2,
    allowNegativeStock: false,
    lowStockThreshold: 5,
    businessStartHour: 6,
    requireCashSessionForSales: true,
  });

  // 5. Crear Proveedores
  const supplierRefrescos = await Supplier.create({
    organizationId: organization._id,
    name: "Distribuidora de Bebidas y Refrescos C.A.",
    contactName: "Juan Pérez",
    phone: "+1 555-0123",
    email: "contacto@distbebidas.com",
  });

  const supplierSnacks = await Supplier.create({
    organizationId: organization._id,
    name: "Comercializadora de Alimentos y Confitería",
    contactName: "Ana Rodríguez",
    phone: "+1 555-0456",
    email: "ventas@confiteria.com",
  });

  // 6. Categorías
  const catBebidas = await Category.create({
    organizationId: organization._id,
    name: "Bebidas y Refrescos",
    slug: "bebidas-y-refrescos",
    icon: "cup-soda",
    color: "#2563eb",
  });

  const catSnacks = await Category.create({
    organizationId: organization._id,
    name: "Snacks y Golosinas",
    slug: "snacks-y-golosinas",
    icon: "cookie",
    color: "#d97706",
  });

  const catAbarrotes = await Category.create({
    organizationId: organization._id,
    name: "Viveres y Abarrotes",
    slug: "viveres-y-abarrotes",
    icon: "shopping-bag",
    color: "#16a34a",
  });

  // 7. Productos Iniciales de Prueba
  await Product.create([
    {
      organizationId: organization._id,
      storeId: store._id,
      sku: "BEB-COCA-600",
      barcode: "7501055300075",
      name: "Coca-Cola 600ml",
      shortName: "Coca-Cola 600",
      description: "Refresco de cola botella plástica 600ml",
      categoryId: catBebidas._id,
      brand: "Coca-Cola",
      unit: "unidad",
      cost: 0.8,
      price: 1.5,
      stock: 48,
      minStock: 12,
      controlType: "simple",
      supplierId: supplierRefrescos._id,
    },
    {
      organizationId: organization._id,
      storeId: store._id,
      sku: "BEB-AGUA-500",
      barcode: "7501055300082",
      name: "Agua Mineral Mineralizada 500ml",
      shortName: "Agua 500ml",
      categoryId: catBebidas._id,
      brand: "Manantial",
      unit: "unidad",
      cost: 0.3,
      price: 0.75,
      stock: 3, // Stock Bajo intencional para alertas
      minStock: 10,
      controlType: "simple",
      supplierId: supplierRefrescos._id,
    },
    {
      organizationId: organization._id,
      storeId: store._id,
      sku: "SNK-PAPA-45G",
      barcode: "7501011122334",
      name: "Papas Fritas Crujientes 45g",
      shortName: "Papas Crujientes",
      categoryId: catSnacks._id,
      brand: "SnackTime",
      unit: "unidad",
      cost: 0.5,
      price: 1.2,
      stock: 30,
      minStock: 8,
      controlType: "simple",
      supplierId: supplierSnacks._id,
    },
    {
      organizationId: organization._id,
      storeId: store._id,
      sku: "ABA-ARROZ-1KG",
      barcode: "7501099988776",
      name: "Arroz Blanco Grano Largo 1kg",
      shortName: "Arroz 1kg",
      categoryId: catAbarrotes._id,
      brand: "La Granja",
      unit: "kg",
      cost: 0.9,
      price: 1.6,
      stock: 25,
      minStock: 5,
      controlType: "simple",
    },
    {
      organizationId: organization._id,
      storeId: store._id,
      sku: "BEB-JUGO-250",
      barcode: "7501055300099",
      name: "Jugo de Naranja 250ml",
      shortName: "Jugo Naranja",
      categoryId: catBebidas._id,
      brand: "Frutty",
      unit: "unidad",
      cost: 0.45,
      price: 1.0,
      stock: 0, // Agotado intencional
      minStock: 10,
      controlType: "simple",
      supplierId: supplierRefrescos._id,
    },
  ]);

  // 8. Crear Sesión de Caja Abierta Inicial
  await CashSession.create({
    organizationId: organization._id,
    storeId: store._id,
    userId: cashierUser._id,
    registerName: "Caja 1 - Principal",
    openedAt: new Date(),
    initialCash: 100.0,
    cashSalesTotal: 0,
    cardSalesTotal: 0,
    transferSalesTotal: 0,
    totalSales: 0,
    cashIns: 0,
    cashOuts: 0,
    expectedCash: 100.0,
    status: "open",
  });

  console.log("✅ Siembra de datos completada exitosamente!");
  console.log("----------------------------------------------");
  console.log("Credenciales de acceso creadas:");
  console.log("👑 Administrador: admin@elarcamarket.com / Admin123!");
  console.log("👔 Supervisor:   supervisor@elarcamarket.com / Super123!");
  console.log("🛒 Cajero:       cajero@elarcamarket.com / Cajero123!");
  console.log("----------------------------------------------");
}

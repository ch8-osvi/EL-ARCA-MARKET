import mongoose from "mongoose";
import { connectDB } from "@/lib/db/mongodb";
import { Organization } from "@/models/Organization";
import { Store } from "@/models/Store";
import { User } from "@/models/User";
import { Settings } from "@/models/Settings";
import { Category } from "@/models/Category";
import { Product } from "@/models/Product";
import { Supplier } from "@/models/Supplier";
import { CashSession } from "@/models/CashSession";
import { hashPassword } from "@/lib/auth/jwt";

async function runReset() {
  try {
    await connectDB();
    console.log("⚠️ ATENCIÓN: Vaciando la base de datos de producción (MongoDB Atlas)...");

    await Promise.all([
      Organization.deleteMany({}),
      Store.deleteMany({}),
      User.deleteMany({}),
      Settings.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Supplier.deleteMany({}),
      CashSession.deleteMany({}),
    ]);

    console.log("✅ Base de datos vaciada.");
    console.log("⚙️ Creando cuenta administradora de Osvaldo...");

    const adminPasswordHash = await hashPassword("Osvaldo.RN8");
    const userId = new mongoose.Types.ObjectId();

    const organization = await Organization.create({
      name: "El Arca Market",
      ownerId: userId,
      active: true,
    });

    const store = await Store.create({
      organizationId: organization._id,
      name: "El Arca Market - Sucursal Principal",
      code: "SUC-01",
      active: true,
    });

    await User.create({
      _id: userId,
      organizationId: organization._id,
      storeId: store._id,
      name: "Osvaldo Appel",
      email: "osvaldojesusappel@gmail.com",
      passwordHash: adminPasswordHash,
      role: "admin",
      active: true,
    });

    await Settings.create({
      organizationId: organization._id,
      storeId: store._id,
      businessName: "El Arca Market",
      currency: "USD",
      currencySymbol: "$",
      decimalPlaces: 2,
      allowNegativeStock: false,
      requireCashSessionForSales: true,
    });

    console.log("🎉 ¡Configuración profesional finalizada!");
    console.log("=========================================");
    console.log("Usuario : osvaldojesusappel@gmail.com");
    console.log("Clave   : Osvaldo.RN8");
    console.log("=========================================");
    process.exit(0);
  } catch (error) {
    console.error("🔴 Error grave al restaurar la BD:", error);
    process.exit(1);
  }
}

runReset();

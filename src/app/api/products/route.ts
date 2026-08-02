import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId");

    const query: any = { active: true };

    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [{ name: regex }, { sku: regex }, { barcode: regex }, { brand: regex }];
    }

    if (categoryId) {
      query.categoryId = categoryId;
    }

    const products = await Product.find(query)
      .populate("categoryId", "name color icon")
      .sort({ name: 1 })
      .lean();

    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    if (!body.name || !body.sku || body.price === undefined || body.cost === undefined) {
      return NextResponse.json(
        { error: "Nombre, SKU, precio y costo son requeridos." },
        { status: 400 }
      );
    }

    let categoryId = body.categoryId;
    if (!categoryId) {
      let defaultCat = await Category.findOne({ slug: "viveres-y-abarrotes" });
      if (!defaultCat) {
        defaultCat = await Category.create({
          organizationId: body.organizationId || new Array(24).fill("0").join(""),
          name: "General",
          slug: "general",
        });
      }
      categoryId = defaultCat._id;
    }

    const newProduct = await Product.create({
      organizationId: body.organizationId || new Array(24).fill("0").join(""),
      sku: body.sku.toUpperCase(),
      barcode: body.barcode || undefined,
      name: body.name,
      shortName: body.shortName,
      description: body.description,
      categoryId,
      brand: body.brand,
      unit: body.unit || "unidad",
      cost: Number(body.cost),
      price: Number(body.price),
      stock: Number(body.stock || 0),
      minStock: Number(body.minStock || 5),
      controlType: body.controlType || "simple",
      allowNegativeStock: Boolean(body.allowNegativeStock),
      active: true,
    });

    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Ya existe un producto con ese SKU o código de barras." },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
